import json
from pathlib import Path

def categoryIcon(category):
    if category == "Appetizers": icon = None
    elif category == "Main courses": icon = '<i class="fas fa-drumstick-bite"></i>'
    elif category == "Desserts": icon = '<i class="fas fa-ice-cream"></i>'
    elif category == "Other": icon = '<i class="fas fa-lemon"></i>'
    else: raise ValueError(f"Category {category} not found.")
    return icon

foodProperties = { # Per 100g, calories / fat / carbohydrates / sugar / protein
    "bell pepper":      [   32,     0.16,   6.7,    4.2,    0.88],
    "carrot":           [   48,     0.35,   10.3,   4.7,    0.94],
    "chicken breast":   [   106,    1.93,   0,      0,      22.5],
    "egg":              [   142,    9.96,   0.96,   0.2,    12.4],
    "egg yolk":         [   322,    26.5,   3.59,   0.56,   15.9],
    "garlic":           [   143,    0.38,   28.2,   1,      6.62],
    "heavy cream":      [   340,    36.1,   2.9,    2.9,    2.84],
    "mascarpone":       [   429,    50,     0,      0,      7.14],
    "milk":             [   61,     3.2,    4.9,    4.9,    3.27],
    "onion":            [   36,     0.13,   7.68,   5.76,   0.89],
    "pasta":            [   371,    1.51,   74.67,  2.7,    13.04],
    "rice":             [   359,    1.3,    79.8,   0,      6.94],
    "savoiardi":        [   367,    3,      77,     40,     7],
    "sugar":            [   385,    0.32,   99.7,   99.7,   0],
    "tomato":           [   18,     0.2,    3.9,    2.6,    0.9]
}
specialFoods = { # Weigh of each e.g. egg in grams
    "bell pepper": 120,
    "carrot": 61,
    "egg": 58,
    "egg yolk": 15,
    "garlic": 5,
    "onion": 160,
    "savoiardi": 10,
    "tomato": 75
}

def getNutrition(string, nutrition):
    ingredient = string.lower().split("(")[0]
    if "tsp" in ingredient or "tbsp" in ingredient: return nutrition
    quantity = ''.join(filter(str.isdigit, ingredient))
    if quantity == '': return nutrition
    else: quantity = float(quantity)

    ingredient = max((s for s in foodProperties.keys() if s in ingredient), key=len, default="")
    factor = quantity/100
    if ingredient in specialFoods: factor *= specialFoods[ingredient]

    try:
        nutrition[ingredient] = [elem*factor for elem in foodProperties[ingredient]]
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

    content = content.replace("{{difficulty}}", recipe["flags"]["difficulty"])
    content = content.replace("{{cuisine}}", recipe["flags"]["cuisine"])
    content = content.replace("{{prepTime}}", recipe["flags"]["prepTime"])
    content = content.replace("{{totalTime}}", recipe["flags"]["totalTime"])

    content = content.replace("{{portions}}", str(recipe["portions"]))

    ingredients = ""
    nutrition = {"dummy": [0,0,0,0,0]}
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

    nutritionKcal = int(sum([nutrition[key][0] for key in nutrition])/recipe["portions"])
    content = content.replace("{{nutritionKcal}}", str(nutritionKcal))
    for i, elem in enumerate(["Kcal","Fat","Carbohydrates","Sugar","Protein"]):
        metric = int(sum([nutrition[key][i] for key in nutrition])/recipe["portions"])
        name = "{{nutrition"+elem+"}}"
        content = content.replace(name, str(metric))

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