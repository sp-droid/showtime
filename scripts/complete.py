import shutil
import pathlib

from tqdm import tqdm

def fillFile(name, HTMLtopbar, favicon, googleAnalytics, rootFolder):
    # Read the source file
    with open(name, 'r', encoding='utf-8') as file:
        contents = file.read()

    # Replace the old string with the new string
    contents = contents.replace("{{HTMLtopbar}}", HTMLtopbar)
    contents = contents.replace("{{favicon}}", favicon)
    contents = contents.replace("{{googleAnalytics}}", googleAnalytics)
    contents = contents.replace("{{rootFolder}}", rootFolder)

    # Write the modified content to the destination file
    with open(name, 'w', encoding='utf-8') as file:
        file.write(contents)

with open("assets/templates/topbar.html", 'r', encoding='utf-8') as file:
    HTMLtopbar = file.read()
with open("assets/templates/favicon.html", 'r', encoding='utf-8') as file:
    favicon = file.read()
with open("assets/templates/googleAnalytics.html", 'r', encoding='utf-8') as file:
    googleAnalytics = file.read()

shutil.copy("assets/templates/about.html", "pages/about.html")
shutil.copy("assets/templates/projects.html", "pages/projects.html")
shutil.copy("assets/templates/blog.html", "pages/blog.html")

for file in tqdm(list(pathlib.Path("pages/").rglob("*.html"))):
    depth = len(file.parents) - 1
    rootFolder = "../" * depth

    fillFile(file, HTMLtopbar, favicon, googleAnalytics, rootFolder)