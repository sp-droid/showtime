import json
from pathlib import Path

import pandas as pd

def categoryIcon(category):
    if category == "Appetizers": icon = None
    elif category == "Main courses": icon = '<i class="fas fa-drumstick-bite"></i>'
    elif category == "Desserts": icon = '<i class="fas fa-ice-cream"></i>'
    elif category == "Other": icon = '<i class="fas fa-lemon"></i>'
    else: raise ValueError(f"Category {category} not found.")
    return icon

# Load ingredient facts datasheet
foodProperties = pd.read_excel("data/foodProperties.xlsx", skiprows=2).fillna(0)
# Load special food conversions, e.g. how many grams is an average egg or garlic clove
with open("data/specialFoods.json", "r") as file: specialFoods = json.load(file)
# Load Dietary reference intakes
with open("data/dietaryReferenceIntakes.json", "r") as file: DRI = json.load(file)
# Load nutrient name conversion table
with open("data/nutrientNames.json", "r") as file: nutrientNames = json.load(file)

def getNutrition(string, nutrition):
    ingredient = string.lower().split("(")[0]
    if "tsp" in ingredient or "tbsp" in ingredient: return nutrition
    quantity = ''.join(filter(str.isdigit, ingredient))
    if quantity == '': return nutrition
    else: quantity = float(quantity)

    ingredient = max((s for s in foodProperties["Ingredient"].values if s in ingredient), key=len, default="")
    # All foods in the datasheet are scaled per 100g
    factor = quantity/100
    # Some of them are assumed to be inputed as single units like an egg or so
    if ingredient in specialFoods: factor *= specialFoods[ingredient]

    try:
        # Load ingredient datasheet corresponding row
        entry = foodProperties[foodProperties["Ingredient"]==ingredient].values[0]
        # Adjust for used quantity
        entry[1:] = [elem*factor for elem in entry[1:]]
        nutrition.loc[ingredient,:] = entry
    except:
        raise ValueError(string)
    
    return nutrition

# Load recipe template
with open(f"templates/recipes/template.html", "r") as file:
    template = file.read()

# List existing recipes
recipes = Path("content/recipes").glob("*")

recipeRows = ""
# Load each file, edit the template accordingly and save as a new html
for recipePath in recipes:
    print(f'---{recipePath.stem}---')
    with open(recipePath, "r", encoding="utf-8") as file:
        recipe = json.load(file)    
    content = template

    content = content.replace("{{baseName}}", recipePath.stem)
    content = content.replace("{{name}}", recipe["name"])
    content = content.replace("{{categoryIcon}}", categoryIcon(recipe["category"]))
    content = content.replace("{{category}}", recipe["category"])
    content = content.replace("{{description}}", recipe["description"])
    content = content.replace("{{origin}}", recipe["origin"])

    content = content.replace("{{difficulty}}", recipe["flags"]["difficulty"])
    content = content.replace("{{cuisine}}", recipe["flags"]["cuisine"])
    content = content.replace("{{prepTime}}", recipe["flags"]["prepTime"])
    content = content.replace("{{totalTime}}", recipe["flags"]["totalTime"])

    content = content.replace("{{portions}}", str(recipe["portions"]))

    ingredients = ""
    nutrition = pd.DataFrame(columns=foodProperties.columns)
    for group in recipe["ingredients"]:
        ingredients += f"<h4>{group}</h4><ul>"
        for ingredient in recipe["ingredients"][group]:
            nutrition = getNutrition(ingredient, nutrition)
            ingredients += f"<li>{ingredient}</li>"
        ingredients += "</ul>"
    content = content.replace("{{ingredients}}", ingredients)

    utensils = ""
    for utensil in recipe["utensils"]:
        utensils += f'<div class="recipeUtensil"><img src="../../img/icons/utensil{utensil}.png" alt=""><div>{utensil}</div></div>'
    content = content.replace("{{utensils}}", utensils)

    instructions = ""
    for i, line in enumerate(recipe["instructions"]):
        if line == "":
            instructions += "<br>"
        elif line[0] == "#":
            instructions += f"<h4>{line[2:]}</h4>"
        elif line[0] == "-":
            if i==0: instructions += "<ol>"
            if recipe["instructions"][i-1][0] != "-":
                instructions += "<ol>"
            instructions += f"<li>{line[2:]}</li>"
            if len(recipe["instructions"])==i+1:
                instructions += "</ol>"
            elif recipe["instructions"][i+1] == "":
                instructions += "</ol>"
            elif recipe["instructions"][i+1][0] != "-":
                instructions += "</ol>"
        else:
            instructions += f'<p style="margin-bottom: 12px;">{line}</p>'
    content = content.replace("{{instructions}}", instructions)

    variants = ""
    if len(recipe["variants"]) > 0:
        variants += "<ul><li>"
        variants += "</li><li>".join(str(elem) for elem in recipe["variants"])
        variants += "</li></ul>"
    content = content.replace("{{variants}}", variants)

    for nutrient in ["Calories","Fat","Carbohydrates","Sugar","Protein"]:
        value = int(sum(nutrition[nutrient].values)/recipe["portions"])
        name = "{{nutrition"+nutrient+"}}"
        content = content.replace(name, str(value))

    nutritionExtra = ""
    for nutrient in [elem for elem in foodProperties.columns if elem not in ["Ingredient","Calories","Fat","Carbohydrates","Sugar","Protein"]]:
        name = nutrientNames[nutrient]
        value = int(sum(nutrition[nutrient].values)/DRI[nutrient]/recipe["portions"]*100)
        if value < 5: continue
        nutritionExtra += f'<div style="display: flex; justify-content: space-between;"><span>{name}</span><span>{value}% DV</span></div>'
    content = content.replace("{{nutritionExtra}}", nutritionExtra)

    nTips = len(recipe["tips"]["culinary"])+len(recipe["tips"]["serving"])
    if nTips == 0: tips = ""
    else:
        tips = ""
        i = 0
        for tip in recipe["tips"]["culinary"]:
            i += 1
            tips += f'<h4 style="color: rgb(222, 70, 62);">CULINARY TIP</h4><p>{tip}</p>'
            if i != nTips: tips += '<hr style="border-top: 3px solid rgb(75, 29, 26);">'
        for tip in recipe["tips"]["serving"]:
            i += 1
            tips += f'<h4 style="color: rgb(222, 70, 62);">SERVING TIP</h4><p>{tip}</p>'
            if i != nTips: tips += '<hr style="border-top: 3px solid rgb(75, 29, 26);">'
        tips = f"""<div class="recipeEndCard" style="border: 3px solid rgb(75, 29, 26); width: 600px;">
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

    recipeRows += "<tr><td>"
    recipeRows += f'<a style="text-decoration: none;" href="recipes/{recipePath.stem}.html">{recipe["name"]}</a>'
    recipeRows += f'</td><td>{recipe["flags"]["cuisine"]}</td></tr>'

with open("templates/recipes/templateIndex.html", "r", encoding="utf-8") as file:
    content = file.read()
content = content.replace("{{recipeRows}}", recipeRows)
with open(f"templates/recipes.html", "w", encoding="utf-8") as file:
    file.write(content)