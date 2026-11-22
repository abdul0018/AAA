# Real products first (mandatory)

**Rule (from the user):** whenever a video names a real product (a car model, a part, a phone, a tool), FIRST find
real photos of that exact product on the internet and generate every illustration FROM them
(`image_references`). Never let the generator invent a "generic hatchback" for "Spark". For cars, use the version
sold in **Uzbekistan** (the audience's own streets), not the US/EU car with the same name.

## Workflow (verified 2026-11-22)
1. Pick the exact model and generation (table below). If unsure, search first and check the photos.
2. Search Wikimedia Commons (free licences, real street photos, often taken in Uzbekistan):
   ```bash
   UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
   curl -s -G https://commons.wikimedia.org/w/api.php -A "$UA" --data-urlencode action=query \
     --data-urlencode list=search --data-urlencode srnamespace=6 --data-urlencode srlimit=25 --data-urlencode format=json \
     --data-urlencode "srsearch=Chevrolet Cobalt Uzbekistan"
   ```
   Commons returns **429 if you query faster than ~1 per 20 s**: space the searches out and don't use the
   batch `imageinfo` query. Add "Uzbekistan", "Tashkent" or "UZ" to the query to get the local version.
3. Download thumbnails to look at them (no API call needed):
   `curl -sL -A "$UA" -o c1.jpg "https://commons.wikimedia.org/wiki/Special:FilePath/<url-encoded file name>?width=800"`
   (sleep 3 s between files). Make a contact sheet and pick: one side or 3/4 view and one straight rear (or front) view
   per product, clean and unobstructed. Reject other generations or markets (e.g. the 2005-2010 US Cobalt).
4. Get the direct URL (`curl -sL -o /dev/null -w "%{url_effective}" ".../Special:FilePath/<name>?width=1200"`), change
   `thumb.wikimedia.org` to `upload.wikimedia.org`, drop the `?utm...` query and pass it to Higgsfield
   **`media_import_url`**. That's one call per photo, with no presigned PUT.
5. Generate with `image_references` = [real photo(s) of the product, then the house-style asset
   (e.g. `car_side.png`)]. In the prompt, name the exact model and list its tell-tale details from the photos
   (lamp shapes, window line, door handles, trunk shape, grille, badge), then the view, colour and house style suffix.
6. Show the user a side-by-side (real photo vs illustration) in QA when the product is central to the video.
7. Credit nothing on screen: the photos are only references. Do record the Commons file names in the video README.

## Uzbekistan car models: the right generation to search
| Name on the street | What it actually is | Commons search |
|---|---|---|
| Spark | Chevrolet Spark M300, facelift (big two-part grille, tall high tail lamps, hidden rear door handles) | `Chevrolet Spark M300`, `Chevrolet Spark Uzbekistan` |
| Cobalt | Chevrolet Cobalt 2nd gen (2011+) sedan, built in Uzbekistan (= Ravon R4) | `Chevrolet Cobalt Uzbekistan`, `Ravon R4` |
| Nexia 3 | Chevrolet Aveo T250 sedan (Ravon Nexia R3) | `Ravon Nexia R3`, `Chevrolet Aveo T250` |
| Nexia (1/2) | Daewoo Nexia (Opel Kadett E based) | `Daewoo Nexia` |
| Gentra / Lacetti | Daewoo/Ravon Gentra (Chevrolet Lacetti J200 based) | `Ravon Gentra`, `Chevrolet Lacetti` |
| Matiz | Daewoo/Chevrolet Matiz M100/M150 | `Daewoo Matiz` |
| Damas / Labo | Daewoo Damas van, Labo pickup | `Daewoo Damas`, `Daewoo Labo` |
| Malibu | Chevrolet Malibu 9th gen (2016+) | `Chevrolet Malibu 2016` |
| Tracker | Chevrolet Tracker 2nd gen (2019+) | `Chevrolet Tracker 2020` |
| Onix | Chevrolet Onix sedan (2nd gen) | `Chevrolet Onix sedan` |
| Captiva | Chevrolet Captiva | `Chevrolet Captiva` |
Check the photos anyway: Commons titles are sometimes wrong.

## Spark/Cobalt reel (the first time this rule applied)
Spark: `0 Chevrolet Spark (M300) 3.jpg` (front 3/4), `0 Chevrolet Spark (M300) 4.jpg` (rear 3/4),
`Chevrolet spark m300 rear.jpg` (rear). Cobalt: `Chevrolet Cobalt, Toshkent.jpg` (rear 3/4),
`Chevrolet Cobalt LTZ, Moʻynoq.jpg` (rear), `Cobalt avtomobili.jpg` (side/top).
