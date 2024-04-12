import json
from pathlib import Path

def categoryIcon(category):
    if category == "Appetizers": icon = None
    elif category == "Main courses": icon = None
    elif category == "Desserts": icon = '<i class="fas fa-ice-cream"></i>'
    elif category == "Other": icon = None
    else: raise ValueError(f"Category {category} not found.")
    return icon

foodProperties = { # Eggs are counted per unit, other things per 100g
    "egg": {"kcal": 66},
    "egg yolk": {"kcal": 52},
    "mascarpone": {"kcal": 355},
    "savoiardi": {"kcal": 40},
    "sugar": {"kcal": 387}
}
specialFoods = {
    "egg": 1,
    "egg yolk": 1,
    "savoiardi": 1
}

def getNutrition(ingredient, nutrition):
    ingredient = ingredient.lower().split("(")[0]
    quantity = ''.join(filter(str.isdigit, ingredient))
    if quantity == '': return nutrition
    else: quantity = float(quantity)

    ingredient = max((s for s in foodProperties.keys() if s in ingredient), key=len, default="")
    factor = quantity/100 if ingredient not in specialFoods else quantity/specialFoods[ingredient]

    nutrition[ingredient] = {k: v*factor for k, v in foodProperties[ingredient].items()}
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
    content = template

    content = content.replace("{{baseName}}", recipePath.stem)
    content = content.replace("{{name}}", recipe["name"])
    content = content.replace("{{categoryIcon}}", categoryIcon(recipe["category"]))
    content = content.replace("{{category}}", recipe["category"])
    content = content.replace("{{description}}", recipe["description"])
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

    content = content.replace("{{kcal}}", str(sum([nutrition[key]["kcal"] for key in nutrition])))

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