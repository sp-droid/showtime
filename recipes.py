import json
from pathlib import Path

def categoryIcon(category):
    if category == "Appetizers": icon = None
    elif category == "Main courses": icon = None
    elif category == "Desserts": icon = '<i class="fas fa-ice-cream"></i>'
    elif category == "Other": icon = None
    else: raise ValueError(f"Category {category} not found.")
    return icon

foodProperties = { # Per 100g, calories / fat / carbohydrates / sugar / protein
    "egg":          [       142,        9.96,       0.96,       0.2,        12.4],
    "egg yolk":     [       322,        26.5,       3.59,       0.56,       15.9],
    "mascarpone":   [       429,        50,         0,          0,          7.14],
    "savoiardi":    [       367,        3,          77,         40,         7],
    "sugar":        [       385,        0.32,       99.7,       99.7,       0]
}
specialFoods = { # Weigh of each e.g. egg in grams
    "egg": 58,
    "egg yolk": 15,
    "savoiardi": 10
}

def getNutrition(ingredient, nutrition):
    ingredient = ingredient.lower().split("(")[0]
    if "tsp" in ingredient or "tbsp" in ingredient: return nutrition
    quantity = ''.join(filter(str.isdigit, ingredient))
    if quantity == '': return nutrition
    else: quantity = float(quantity)

    ingredient = max((s for s in foodProperties.keys() if s in ingredient), key=len, default="")
    factor = quantity/100
    if ingredient in specialFoods: factor *= specialFoods[ingredient]

    nutrition[ingredient] = [elem*factor for elem in foodProperties[ingredient]]
    print(ingredient)
    return nutrition
    


# Load recipe template
with open(f"templates/recipes/template.html", "r") as file:
    template = file.read()

# List existing recipes
recipes = Path("content/recipes").glob("*")

# Load each file, edit the template accordingly and save as a new html
for recipePath in recipes:
    with open(recipePath, "r", encoding="utf-8") as file:
        recipe = json.load(file)
        print(f'---{recipe["name"]}---')
    content = template

    content = content.replace("{{baseName}}", recipePath.stem)
    content = content.replace("{{name}}", recipe["name"])
    content = content.replace("{{categoryIcon}}", categoryIcon(recipe["category"]))
    content = content.replace("{{category}}", recipe["category"])
    content = content.replace("{{description}}", recipe["description"])
    content = content.replace("{{origin}}", recipe["origin"])
    content = content.replace("{{flags}}", "<br>".join(f"{k}: {v}" for k, v in recipe["flags"].items()))
    content = content.replace("{{portions}}", str(recipe["portions"]))

    ingredients = ""
    nutrition = {}
    for group in recipe["ingredients"]:
        ingredients += f"<h4>{group}</h4><ul>"
        for ingredient in recipe["ingredients"][group]:
            nutrition = getNutrition(ingredient, nutrition)
            ingredients += f"<li>{ingredient}</li>"
        ingredients += "</ul>"
    content = content.replace("{{ingredients}}", ingredients)
    content = content.replace("{{utensils}}", "<br>".join(str(elem) for elem in recipe["utensils"]))

    instructions = ""
    for i, line in enumerate(recipe["instructions"]):
        if line == "":
            instructions += "<br>"
        elif line[0] == "#":
            instructions += f"<h4>{line[2:]}</h4>"
        elif line[0] == "-":
            if recipe["instructions"][i-1][0] != "-":
                instructions += "<ol>"
            instructions += f"<li>{line[2:]}</li>"
            if recipe["instructions"][i+1] == "":
                instructions += "</ol>"
            elif recipe["instructions"][i+1][0] != "-":
                instructions += "</ol>"
        else:
            instructions += f'<p style="margin-bottom: 12px;">{line}</p>'
    content = content.replace("{{instructions}}", instructions)

    content = content.replace("{{variants}}", str(recipe["variants"]))

    content = content.replace("{{kcal}}", str(sum([nutrition[key][0] for key in nutrition])))

    nTips = len(recipe["tips"]["culinary"])+len(recipe["tips"]["serving"])
    if nTips == 0: tips = ""
    else:
        tips = ""
        i = 0
        for tip in recipe["tips"]["culinary"]:
            i += 1
            tips += f"<h4>CULINARY TIP</h4><p>{tip}</p>"
            if i != nTips: tips += '<hr style="border-top: 3px solid rgb(75, 29, 26);">'
        for tip in recipe["tips"]["serving"]:
            i += 1
            tips += f"<h4>SERVING TIP</h4><p>{tip}</p>"
            if i != nTips: tips += '<hr style="border-top: 3px solid rgb(75, 29, 26);">'
        tips = f"""<div class="recipeEndCard" style="border: 3px solid rgb(75, 29, 26);">
                    <div style="background-color: rgb(219, 50, 41);">
                        <i style="font-size: 40px; color: black;" class="fas fa-apple-alt"></i>
                    </div>
                    <div>
                        {tips}
                    </div>
                </div>"""
    content = content.replace("{{tips}}", tips)

    with open(f"templates/recipes/{recipePath.stem}.html", "w", encoding="utf-8") as file:
        file.write(content)