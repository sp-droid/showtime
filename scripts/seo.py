import re
import json

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
<url>
  <loc>https://pabloarbelo.com/templates/index.html</loc>
  <priority>0.7</priority>
</url>
<url>
  <loc>https://pabloarbelo.com/templates/about.html</loc>
  <priority>0.7</priority>
</url>

<!-- PROJECTS -->
<url>
  <loc>https://pabloarbelo.com/templates/projects.html</loc>
  <priority>0.7</priority>
</url>'''

with open("content/projects.json", "r", encoding="utf-8") as file:
    contents = json.load(file)
for entry in contents:
    if entry["link"][:2] == "..":
        sitemap += f'\n<url><loc>https://pabloarbelo.com/{entry["link"][3:]}</loc></url>'

sitemap += '''\n
<!-- RECIPES -->
<url>
  <loc>https://pabloarbelo.com/templates/recipes.html</loc>
  <priority>0.7</priority>
</url>'''
# Recipes
with open(f"templates/recipes.html", "r", encoding="utf-8") as file:
    contents = file.read()

pattern = r'href="recipes/([^"]+).html'
matches = re.findall(pattern, contents)
for match in matches:
    sitemap += f'\n<url><loc>https://pabloarbelo.com/templates/recipes/{match}.html</loc></url>'

sitemap += "\n\n</urlset>"

with open("sitemap.xml", "w", encoding="utf-8") as file:
    file.write(sitemap)