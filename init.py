import subprocess

print("Recipes: ")
from scripts import recipes

print("\nBlog: ")
workingDirectory = "scripts/blog"
command = ['node', 'blog.js']
result = subprocess.run(command, cwd=workingDirectory, capture_output=True, text=True)
if result.stdout != "": print('STDOUT:', result.stdout)
if result.stderr != "": print('STDERR:', result.stderr)

print("Complete: ")
from scripts import complete

print("\nSEO: ")
from scripts import seo