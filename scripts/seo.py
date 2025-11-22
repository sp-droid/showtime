import re
import json
import pathlib

from tqdm import tqdm

sitemap = '''<?xml version="1.0" encoding="UTF-8"?>
<urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
            
<url>
  <loc>https://pabloarbelo.com/</loc>
  <priority>0.9</priority>
</url>
'''

for file in tqdm(list(pathlib.Path("pages/").rglob("*.html"))):
    if file.stem == "literature_review" or file.stem == "progress_log" or file.stem == "technical_notes":
        continue # Remove this when it's ok to publish the thesis
    sitemap += f'\n<url><loc>https://pabloarbelo.com/{str(file).replace("\\","/")}</loc></url>'

with open("content/projects.json", "r", encoding="utf-8") as file:
    contents = json.load(file)
for entry in contents:
    if entry["link"][:2] == "..":
        sitemap += f'\n<url><loc>https://pabloarbelo.com/{entry["link"][3:]}</loc></url>'

sitemap += "\n\n</urlset>"

with open("sitemap.xml", "w", encoding="utf-8") as file:
    file.write(sitemap)