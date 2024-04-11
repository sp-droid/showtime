import json
from pathlib import Path

def categoryIcon(category):
    if category == "Appetizer": icon = None
    elif category == "Main course": icon = None
    elif category == "Dessert": icon = '<i class="fas fa-ice-cream"></i>'
    elif category == "Other": icon = None
    else: raise ValueError(f"Category {category} not found.")
    return icon

# Load recipe template
with open(f"templates/recipes/template.html", "r") as file:
    template = file.read()

# List existing recipes
recipes = Path("content/recipes").glob("*")

# Load each file, edit the template accordingly and save as a new html
for recipePath in recipes:
    with open(recipePath, "r", encoding="utf-8") as file:
        recipe = json.load(file)
    content = template

    content = content.replace("{{baseName}}", recipePath.stem)
    content = content.replace("{{name}}", recipe["name"])
    content = content.replace("{{categoryIcon}}", categoryIcon(recipe["category"]))
    content = content.replace("{{category}}", recipe["category"])
    content = content.replace("{{description}}", recipe["description"])

    with open(f"templates/recipes/{recipePath.stem}.html", "w", encoding="utf-8") as file:
        file.write(content)