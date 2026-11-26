# Mashina raqami nimani yashiradi? (1:1 remake, chase-cam style in Remotion)

A remake of an 88 s reference: the same script, beats and chase-camera look, but voiced by Adizzbek and fully drawn
in Remotion. Higgsfield credits were 0, so the reference's 3D renders were rebuilt as SVG illustration.
Length 81.2 s.

- `src/Parts.tsx`:
  - a perspective avenue: poplar rows and lane dashes scrolling toward the camera, sway, haze
  - 4 car-rear types: Cobalt-like sedan, BYD-like SUV, Sprinter ambulance with blinking beacons, Maybach-like lux
  - Uzbek plates: `std` (region box + UZ flag), `yellow`, `ev` (green region box), `flag` (flag, no region),
    `cmd` (green plate); a highlight ring on the region code or the suffix
- `src/PlatesReel.tsx`: 11 shots in the reference's order, each with a lane-change entry and a push-in to the plate.
  - plates: A 482 KA → H 048213 → B 271 EA → 318 STY → 024 DAV → PAA 215 → PPP 164 → APC 031 → CMD 4501 → 10 777 ZZZ
  - the 777 ZZZ shot carries the auction price overlay ("1 560 000 000 so'm, 2025-yil iyun", from the reference)
    and "= 9 Cobalt"
  - the final plate lifts off, spins away and comes back
- Sound: road ambience loop, lane-change whooshes, ambulance siren, polite horn on each "signal",
  EV charge click, ka-ching, plate click, kit pops, music bed at -12 dB. -14 LUFS.
- Script: reconstructed from the reference. Lines Whisper couldn't recover were rewritten with the same meaning
  ("Yo'l so'rasa, yordam bering, u adashib qolgan"; the plate-keeping line).
