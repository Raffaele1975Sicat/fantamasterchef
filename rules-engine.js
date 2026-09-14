/* Fanta MasterChef — centralized scoring engine
 * Block 01: rules / scoring foundation
 *
 * The engine is deliberately independent from Supabase and the UI.
 * It consumes plain objects and returns deterministic numeric results.
 * No rounding is ever performed: half-points are preserved.
 */
(function (root) {
  'use strict';

  var DEFAULT_RULES = {
    bonus_mystery_box: 3,
    bonus_esterna: 4,
    bonus_cucina: 4,
    bonus_miglior_piatto: 2,
    penalita_nero: -3,
    penalita_esterna: -2
  };

  function n(value, fallback) {
    var x = Number(value);
    return Number.isFinite(x) ? x : (fallback || 0);
  }

  function rulesWithDefaults(settings) {
    var r = {};
    Object.keys(DEFAULT_RULES).forEach(function (k) {
      r[k] = settings && settings[k] != null ? n(settings[k], DEFAULT_RULES[k]) : DEFAULT_RULES[k];
    });
    return r;
  }

  function eventFor(events, episodeId, chefId) {
    return (events || []).find(function (e) {
      return e.episode_id === episodeId && e.concorrente_id === chefId;
    }) || null;
  }

  function basePoints(events, episodeId, chefId, settings) {
    var e = eventFor(events, episodeId, chefId);
    if (!e) return { bonus: 0, penalty: 0, total: 0 };

    var r = rulesWithDefaults(settings);
    var bonus = 0;

    // Bonuses are cumulative.
    if (e.mystery_box) bonus += r.bonus_mystery_box;
    if (e.vince_esterna) bonus += r.bonus_esterna;
    if (e.vince_cucina) bonus += r.bonus_cucina;
    if (e.miglior_piatto) bonus += r.bonus_miglior_piatto;

    // Penalties are non-cumulative: one event can carry only one penalty.
    var penalty = 0;
    if (e.penalita === 'nero') penalty = r.penalita_nero;
    else if (e.penalita === 'esterna') penalty = r.penalita_esterna;

    return { bonus: bonus, penalty: penalty, total: bonus + penalty };
  }

  function findActivation(activations, episodeId, predicate) {
    return (activations || []).find(function (a) {
      return a.episode_id === episodeId && predicate(a);
    }) || null;
  }

  function chefContribution(teamId, chefId, episodeId, events, activations, settings) {
    var bp = basePoints(events, episodeId, chefId, settings);
    var bonus = bp.bonus;
    var penalty = bp.penalty;

    // Fornelli Spenti: opponent receives zero bonuses; any penalty is doubled.
    var spento = findActivation(activations, episodeId, function (a) {
      return a.card_key === 'fornelli_spenti' &&
        a.target_team_id === teamId &&
        a.target_concorrente_id === chefId;
    });
    if (spento) {
      bonus = 0;
      if (penalty !== 0) penalty *= 2;
    }

    // Salvataggio all'Ultimo Secondo and Variazione Artusi each annul one penalty.
    // The regulation allows only one penalty per chef/episode, so both are equivalent
    // at score level; usage validity is enforced by the card layer.
    var saved = findActivation(activations, episodeId, function (a) {
      return (a.card_key === 'salvataggio' || a.card_key === 'variazione_artusi') &&
        a.team_id === teamId &&
        a.target_concorrente_id === chefId;
    });
    if (saved) penalty = 0;

    var total = bonus + penalty;

    // Secondo Intuito acts on the resulting chef score and may produce .5 points.
    var doubled = findActivation(activations, episodeId, function (a) {
      return a.card_key === 'secondo_intuito' &&
        a.team_id === teamId &&
        a.scelta === 'x2' &&
        a.target_concorrente_id === chefId;
    });
    if (doubled) total *= 2;

    var halved = findActivation(activations, episodeId, function (a) {
      return a.card_key === 'secondo_intuito' &&
        a.target_team_id === teamId &&
        a.scelta === 'dimezza' &&
        a.target_concorrente_id === chefId;
    });
    if (halved) total /= 2;

    return total;
  }

  function activeTeamChefs(teamId, teamChefs) {
    return (teamChefs || []).filter(function (tc) {
      return tc.team_id === teamId && tc.attivo;
    });
  }

  function teamEpisodeScore(teamId, episodeId, teamChefs, events, activations, settings) {
    // Chef Ombra counts from the first confirmed episode. The 31/01/2027 reveal
    // changes visibility only; it does not retroactively recalculate the score.
    return activeTeamChefs(teamId, teamChefs).reduce(function (sum, tc) {
      return sum + chefContribution(teamId, tc.concorrente_id, episodeId, events, activations, settings);
    }, 0);
  }

  function standings(teams, episodes, teamChefs, events, activations, settings) {
    var confirmed = (episodes || [])
      .filter(function (e) { return !!e.confermata; })
      .slice()
      .sort(function (a, b) { return n(a.numero) - n(b.numero); });

    var rows = (teams || []).map(function (team) {
      var perEpisode = confirmed.map(function (ep) {
        return {
          id: ep.id,
          numero: ep.numero,
          punti: teamEpisodeScore(team.id, ep.id, teamChefs, events, activations, settings)
        };
      });
      var total = n(team.punti_ingresso) + perEpisode.reduce(function (s, p) { return s + p.punti; }, 0);
      return { team: team, total: total, perEpisode: perEpisode };
    });

    rows.sort(function (a, b) { return b.total - a.total; });

    // Competition ranking: equal scores receive the same position.
    var last = null;
    var pos = 0;
    rows.forEach(function (row, i) {
      if (last === null || row.total !== last) {
        pos = i + 1;
        last = row.total;
      }
      row.pos = pos;
    });

    return rows;
  }

  root.FantaRules = {
    DEFAULT_RULES: DEFAULT_RULES,
    rulesWithDefaults: rulesWithDefaults,
    eventFor: eventFor,
    basePoints: basePoints,
    chefContribution: chefContribution,
    teamEpisodeScore: teamEpisodeScore,
    standings: standings
  };
})(typeof window !== 'undefined' ? window : globalThis);
