import json
import hashlib
import argparse
from pathlib import Path

from tqdm import tqdm

parser = argparse.ArgumentParser(description="Build recipe pages and their index")
parser.add_argument("--index-only", action="store_true", help="Rebuild the Recipes index and its data without touching detail pages or their cache")
args = parser.parse_args()

if not args.index_only:
    import pandas as pd

def categoryIcon(category):
    if category == "Appetizers": icon = None
    elif category == "Main courses": icon = '<i class="fas fa-drumstick-bite"></i>'
    elif category == "Desserts": icon = '<i class="fas fa-ice-cream"></i>'
    elif category == "Drinks": icon = '<i class="fa-solid fa-beer-mug-empty"></i>'
    elif category == "Other": icon = '<i class="fas fa-lemon"></i>'
    else: raise ValueError(f"Category {category} not found.")
    return icon

if not args.index_only:
    # Nutrition data is only needed when rendering detail pages.
    foodProperties = pd.read_excel("assets/data/recipes/foodProperties.xlsx", skiprows=2).fillna(0)
    with open("assets/data/recipes/specialFoods.json", "r") as file: specialFoods = json.load(file)
    with open("assets/data/recipes/dietaryReferenceIntakes.json", "r") as file: DRI = json.load(file)
    with open("assets/data/recipes/nutrientNames.json", "r") as file: nutrientNames = json.load(file)

# Shared layout snippets
with open("assets/templates/topbar.html", 'r', encoding='utf-8') as file:
    HTMLtopbar = file.read()
with open("assets/templates/favicon.html", 'r', encoding='utf-8') as file:
    favicon = file.read()
with open("assets/templates/googleAnalytics.html", 'r', encoding='utf-8') as file:
    googleAnalytics = file.read()

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

# Load the detail template only when detail pages are being rendered.
if not args.index_only:
    with open("assets/templates/recipes/recipe.html", "r", encoding="utf-8") as file:
        template = file.read()
    render_signature = hashlib.sha256(
        (template + HTMLtopbar + favicon + googleAnalytics).encode("utf-8")
    ).hexdigest()

# List existing recipes
recipes = sorted(Path("content/recipes").glob("*.json"))

# Lightweight cache so we can avoid re-processing recipe
# JSON files whose size hasn't changed since the last run.
cache_path = Path("scripts/cache-recipes.json")
recipe_cache = {}
if not args.index_only and cache_path.exists():
    try:
        with cache_path.open('r', encoding='utf-8') as f:
            recipe_cache = json.load(f)
    except Exception:
        recipe_cache = {}


def should_skip_recipe(path: Path, cache: dict) -> bool:
    """Return True if the recipe JSON should be skipped based on size cache."""
    try:
        size = path.stat().st_size
    except FileNotFoundError:
        # New or missing file: must process.
        return False

    key = str(path)
    prev = cache.get(key)
    output_path = Path("pages/recipes") / f"{path.stem}.html"
    if (prev is not None and prev.get("size") == size
            and prev.get("renderSignature") == render_signature
            and output_path.exists()):
        return True

    cache[key] = {"size": size, "renderSignature": render_signature}
    return False

# Load each file, edit the template accordingly and save as a new html
index_entries = []
pbar = tqdm(recipes, disable=args.index_only)
skipped = 0
for recipePath in pbar:
    pbar.set_postfix_str(f"Current recipe: {recipePath.stem}, skipped: {skipped}")

    with open(recipePath, "r", encoding="utf-8") as file:
        recipe = json.load(file)

    flags = recipe["flags"]
    index_entries.append({
        "file": recipePath.stem,
        "name": recipe["name"],
        "category": recipe["category"],
        "cuisine": flags["cuisine"],
        "time": flags["prepTime"] if flags["totalTime"] == "Idem" else flags["totalTime"],
        "prepTime": flags["prepTime"],
        "difficulty": flags["difficulty"],
        "finished": flags["finished"],
        "lactoseFree": flags["lactoseFree"],
        "glutenFree": flags["glutenFree"],
        "vegetarian": flags["vegetarian"],
        "vegan": flags["vegan"],
        "origin": recipe["origin"],
        "description": recipe["description"],
    })

    if args.index_only:
        continue

    # Only regenerate the per-recipe HTML page when the
    # underlying JSON file changed size since last run.
    if should_skip_recipe(recipePath, recipe_cache): 
        skipped += 1
        pbar.set_postfix_str(f"Current recipe: {recipePath.stem}, skipped: {skipped}")
        continue

    content = template

    content = content.replace("{{baseName}}", recipePath.stem)
    content = content.replace("{{name}}", recipe["name"])
    photo_path = Path("assets/img/recipes") / f"{recipePath.stem}.jpg"
    if photo_path.exists():
        hero_media = f'<img src="../../assets/img/recipes/{recipePath.stem}.jpg" alt="Photo of {recipe["name"]}">'
        backdrop = f'<div class="recipe-backdrop" style="background-image: url(\'../../assets/img/recipes/{recipePath.stem}.jpg\')" aria-hidden="true"></div>'
        image_url = f'https://sp-droid.github.io/showtime/assets/img/recipes/{recipePath.stem}.jpg'
        open_graph_image = (
            f'<meta name="image" property="og:image" content="{image_url}">\n'
            f'    <meta property="og:image:secure_url" content="{image_url}">\n'
            '    <meta property="og:image:type" content="image/jpg">\n'
            '    <meta property="og:image:width" content="1188">\n'
            '    <meta property="og:image:height" content="665">'
        )
    else:
        hero_media = '<div class="recipe-hero-placeholder" role="img" aria-label="Photo coming soon"><i class="fa-solid fa-utensils" aria-hidden="true"></i><span>Photo coming soon</span></div>'
        backdrop = ''
        open_graph_image = ''
    content = content.replace("{{heroMedia}}", hero_media)
    content = content.replace("{{backdrop}}", backdrop)
    content = content.replace("{{openGraphImage}}", open_graph_image)
    content = content.replace("{{categoryIcon}}", categoryIcon(recipe["category"]))
    content = content.replace("{{category}}", recipe["category"])
    content = content.replace("{{description}}", recipe["description"])
    origin = recipe["origin"].strip()
    origin_block = (
        f'<div class="recipe-origin"><span>Origin</span><p>{origin}</p></div>'
        if origin and origin not in ("-", "No information") else ""
    )
    content = content.replace("{{originBlock}}", origin_block)

    content = content.replace("{{difficulty}}", recipe["flags"]["difficulty"])
    cuisine = recipe["flags"]["cuisine"]
    cuisine_image = Path("assets/img/icons") / f"cuisine{cuisine}.png"
    cuisine_icon = (
        f'<img src="../../assets/img/icons/{cuisine_image.name}" alt="{cuisine} cuisine icon">'
        if cuisine_image.exists() else '<i class="fa-solid fa-globe" aria-hidden="true"></i>'
    )
    content = content.replace("{{cuisineIcon}}", cuisine_icon)
    content = content.replace("{{cuisine}}", cuisine)
    content = content.replace("{{prepTime}}", recipe["flags"]["prepTime"])
    total_time = recipe["flags"]["totalTime"]
    content = content.replace("{{totalTime}}", recipe["flags"]["prepTime"] if total_time == "Idem" else total_time)

    content = content.replace("{{portions}}", str(recipe["portions"]))
    content = content.replace("{{servingUnit}}", "serving" if recipe["portions"] == 1 else "servings")

    ingredients = ""
    nutrition = pd.DataFrame(columns=foodProperties.columns)
    for group in recipe["ingredients"]:
        if group:
            ingredients += f"<h3>{group}</h3>"
        ingredients += "<ul>"
        for ingredient in recipe["ingredients"][group]:
            nutrition = getNutrition(ingredient, nutrition)
            ingredients += f"<li>{ingredient}</li>"
        ingredients += "</ul>"
    content = content.replace("{{ingredients}}", ingredients)

    utensils_section = ""
    if recipe["utensils"]:
        utensils = "".join(
            f'<div class="recipeUtensil"><img src="../../assets/img/icons/utensil{utensil}.png" alt=""><span>{utensil}</span></div>'
            for utensil in recipe["utensils"]
        )
        utensils_section = (
            '<h2>Utensils</h2><div class="recipeUtensils">'
            + utensils + '</div><hr>'
        )
    content = content.replace("{{utensilsSection}}", utensils_section)

    instruction_parts = []
    numbered_steps_open = False
    for line in recipe["instructions"]:
        if line.startswith("- "):
            if not numbered_steps_open:
                instruction_parts.append("<ol>")
                numbered_steps_open = True
            instruction_parts.append(f"<li>{line[2:]}</li>")
            continue
        if numbered_steps_open:
            instruction_parts.append("</ol>")
            numbered_steps_open = False
        if not line:
            continue
        if line.startswith("# "):
            instruction_parts.append(f"<h3>{line[2:]}</h3>")
        else:
            instruction_parts.append(f"<p>{line}</p>")
    if numbered_steps_open:
        instruction_parts.append("</ol>")
    instructions = "".join(instruction_parts)
    content = content.replace("{{instructions}}", instructions)

    variants_section = ""
    if recipe["variants"]:
        variants = "<ul><li>" + "</li><li>".join(str(elem) for elem in recipe["variants"]) + "</li></ul>"
        variants_section = f"<hr><h2>Variations</h2>{variants}"
    content = content.replace("{{variantsSection}}", variants_section)

    for nutrient in ["Calories","Fat","Carbohydrates","Sugar","Protein"]:
        value = int(sum(nutrition[nutrient].values)/recipe["portions"])
        name = "{{nutrition"+nutrient+"}}"
        content = content.replace(name, str(value))

    nutritionExtra = ""
    for nutrient in [elem for elem in foodProperties.columns if elem not in ["Ingredient","Calories","Fat","Carbohydrates","Sugar","Protein"]]:
        name = nutrientNames[nutrient]
        value = int(sum(nutrition[nutrient].values)/DRI[nutrient]/recipe["portions"]*100)
        if value < 5: continue
        nutritionExtra += f'<div class="recipe-nutrition__row"><span>{name}</span><span>{value}% DV</span></div>'
    content = content.replace("{{nutritionExtra}}", nutritionExtra)

    nTips = len(recipe["tips"]["culinary"])+len(recipe["tips"]["serving"])
    if nTips == 0: tips = ""
    else:
        tips = ""
        i = 0
        for tip in recipe["tips"]["culinary"]:
            i += 1
            tips += f'<h4>CULINARY TIP</h4><p>{tip}</p>'
            if i != nTips: tips += '<hr>'
        for tip in recipe["tips"]["serving"]:
            i += 1
            tips += f'<h4>SERVING TIP</h4><p>{tip}</p>'
            if i != nTips: tips += '<hr>'
        tips = f"""<div class="recipeEndCard recipe-tip-card">
                    <div>
                        <i class="fas fa-apple-alt" aria-hidden="true"></i>
                    </div>
                    <div>
                        {tips}
                    </div>
                </div>"""
    content = content.replace("{{tips}}", tips)

    # Inject shared layout fragments (same as complete.py)
    # Root folder for individual recipes is two levels up
    # from pages/recipes/*.html -> site root.
    rootFolder = "../../"
    content = content.replace("{{HTMLtopbar}}", HTMLtopbar)
    content = content.replace("{{favicon}}", favicon)
    content = content.replace("{{googleAnalytics}}", googleAnalytics)
    content = content.replace("{{rootFolder}}", rootFolder)

    with open(f"pages/recipes/{recipePath.stem}.html", "w", encoding="utf-8") as file:
        file.write("\n".join(line.rstrip() for line in content.split("\n")))

with open("assets/templates/recipes.html", "r", encoding="utf-8") as file:
    content = file.read()

index_data_path = Path("content/recipes-index.json")
index_data_path.write_text(
    json.dumps(index_entries, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8",
)

# Inject shared layout fragments for the recipes index.
# recipes.html lives directly under pages/, so its
# rootFolder is "./" relative to site root.
rootFolder_index = "../"
content = content.replace("{{HTMLtopbar}}", HTMLtopbar)
content = content.replace("{{favicon}}", favicon)
content = content.replace("{{googleAnalytics}}", googleAnalytics)
content = content.replace("{{rootFolder}}", rootFolder_index)

with open(f"pages/recipes.html", "w", encoding="utf-8") as file:
    file.write(content)

# Persist updated recipe cache at the end
if not args.index_only:
    try:
        cache_path.parent.mkdir(parents=True, exist_ok=True)
        with cache_path.open('w', encoding='utf-8') as f:
            json.dump(recipe_cache, f, indent=2)
    except Exception:
        pass
