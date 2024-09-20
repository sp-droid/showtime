document.addEventListener("DOMContentLoaded", function() {
    const tableRecipesBody = document.getElementById('tableRecipes').children[1];

    const imageRecipe = document.getElementById('imageRecipe');
    const titleRecipe = document.getElementById('titleRecipe');
    const buttonPrevRecipe = document.getElementById('buttonPrevRecipe');
    const buttonNextRecipe = document.getElementById('buttonNextRecipe');
    const flagDifficulty = document.getElementById('flagDifficulty');
    const flagCuisine = document.getElementById('flagCuisine');
    const flagPrepTime = document.getElementById('flagPrepTime');
    const flagTotalTime = document.getElementById('flagTotalTime');

    let data = [];

    for (let i = 0; i < tableRecipesBody.children.length; i++) {
        const row = tableRecipesBody.children[i].children;

        data[i] = {
            'name': row[0].textContent,
            'category': row[1].textContent,
            'cuisine': row[2].textContent,
            'finished': row[3].textContent,
            'time': row[4].textContent,
            'difficulty': row[5].textContent,
            'file': row[6].textContent,
            'origin': row[7].textContent,
            'description': row[8].textContent,
            'prepTime': row[9].textContent
        }  
    }

    tableRecipesBody.innerHTML = '';
    for (let i = 0; i < data.length; i++) {
        const newRow = document.createElement('tr');

        const name = document.createElement('td');
        const link = document.createElement('a');
        link.textContent = data[i]['name'];
        link.href = `recipes/${data[i]['file']}.html`;
        link.title = data[i]['description'];
        name.appendChild(link);
        newRow.appendChild(name);

        const category = document.createElement('td');
        category.textContent = data[i]['category'];
        newRow.appendChild(category);

        const cuisine = document.createElement('td');
        cuisine.textContent = data[i]['cuisine'];
        cuisine.title = data[i]['origin'];
        newRow.appendChild(cuisine);

        const finished = document.createElement('td');
        finished.textContent = data[i]['finished'];
        newRow.appendChild(finished);

        const time = document.createElement('td');
        time.textContent = data[i]['time'];
        newRow.appendChild(time);

        const difficulty = document.createElement('td');
        const diffImage = document.createElement('img');
        diffImage.src = `../assets/img/icons/difficulty${data[i]['difficulty']}.png`;
        diffImage.title = data[i]['difficulty'];
        difficulty.appendChild(diffImage);
        newRow.appendChild(difficulty);

        tableRecipesBody.appendChild(newRow);
    }

    i = 0;
    imageRecipe.src = `../assets/img/recipes/${data[i]['file']}.jpg`;
    titleRecipe.children[0].textContent = data[i]['name']
    titleRecipe.href = `recipes/${data[i]['file']}.html`;
    flagDifficulty.children[0].src = `../assets/img/icons/difficulty${data[i]['difficulty']}.png`;
    flagDifficulty.children[1].textContent = data[i]['difficulty'];
    flagCuisine.children[0].src = `../assets/img/icons/cuisine${data[i]['cuisine']}.png`;
    flagCuisine.children[1].textContent = data[i]['cuisine'];
    flagPrepTime.textContent = data[i]['prepTime'];
    flagTotalTime.textContent = data[i]['time'];

    console.log(data)
});