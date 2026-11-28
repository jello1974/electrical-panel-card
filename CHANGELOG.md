# Changelog

## 1.0.4
- Optional fault sensor per module (`fault_sensor`, `fault_state`): the breaker turns OrangeRed and shows a warning badge while the fault is active.
- Optional blinking for faulted breakers (`fault_blink`, global or per module). Disabled automatically when the device prefers reduced motion.
- Translations for the new options (EN / RO / FR).

## 1.0.3
- Card picker description now lists the supported languages (EN / RO / FR).
- Documentation: English is the default language; `language: auto` follows the Home Assistant language. French added to the READMEs.
- README links point to the real repository.
- Installation: HACS first (with the “Open in My Home Assistant” button); the custom-repository steps stay as a collapsed fallback; badge updated.

## 1.0.2
- French translation (thanks to [@Nono01360](https://github.com/Nono01360)).
- `documentationURL` points to the repository.

## 1.0.1
- Maintenance release (see the GitHub release notes).

## 1.0.0
First public release.
- Realistic SVG electrical panel card with DIN rails, cable ducts and engraved row labels.
- Visual editor: rows, modules, models, entities, thresholds.
- Models: 1P/2P/3P/4P breakers, RCBO, 2P/4P RCD, main switch, meter, blank cover.
- Optional voltage, current and temperature sensors per module.
- Automatic max power from voltage × current rating; yellow/red thresholds.
- Confirmation dialog before switching (global / per breaker / only when turning off).
- English and Romanian.
- Dark and light themes.