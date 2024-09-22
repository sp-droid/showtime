document.addEventListener("DOMContentLoaded", function() {
    const tableRecipesBody = document.getElementById('tableRecipes').children[1];
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

    fillTable();

    let selected = 0;
    let prevSelected = 0;
    const imageRecipe = document.getElementById('imageRecipe');
    const titleRecipe = document.getElementById('titleRecipe');
    const buttonPrevRecipe = document.getElementById('buttonPrevRecipe');
    const buttonNextRecipe = document.getElementById('buttonNextRecipe');
    const flagDifficulty = document.getElementById('flagDifficulty');
    const flagCuisine = document.getElementById('flagCuisine');
    const flagPrepTime = document.getElementById('flagPrepTime');
    const flagTotalTime = document.getElementById('flagTotalTime');
    selectRecipe(selected);

    buttonPrevRecipe.addEventListener('click', function() {
        prevSelected = selected;
        selected -= 1;
        if (selected < 0) { selected = data.length - 1; }
        selectRecipe(selected);
    })
    buttonNextRecipe.addEventListener('click', function() {
        prevSelected = selected;
        selected += 1;
        if (selected == data.length) { selected = 0; }
        selectRecipe(selected);
    })
    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            prevSelected = selected;
            selected -= 1;
            if (selected < 0) { selected = data.length - 1; }
            selectRecipe(selected);
        } else if (event.key === 'ArrowRight') {
            prevSelected = selected;
            selected += 1;
            if (selected == data.length) { selected = 0; }
            selectRecipe(selected);
        }
    });

    function selectRecipe(i) {
        tableRecipesBody.children[prevSelected].children[0].style.fontWeight = 'normal';

        imageRecipe.style.opacity = 0;
        setTimeout(() => {
            imageRecipe.src = `../assets/img/recipes/${data[i]['file']}.jpg`;
            imageRecipe.onload = () => {
                imageRecipe.style.opacity = 1;
            };
            imageRecipe.title = data[i]['description'];
        }, 200);
        titleRecipe.children[0].textContent = data[i]['name']
        titleRecipe.href = `recipes/${data[i]['file']}.html`;
        flagDifficulty.children[0].src = `../assets/img/icons/difficulty${data[i]['difficulty']}.png`;
        flagDifficulty.children[1].textContent = data[i]['difficulty'];
        flagCuisine.children[0].src = `../assets/img/icons/cuisine${data[i]['cuisine']}.png`;
        flagCuisine.children[1].textContent = data[i]['cuisine'];
        flagCuisine.title = data[i]['origin'];
        flagPrepTime.textContent = data[i]['prepTime'];
        flagTotalTime.textContent = data[i]['time'];

        tableRecipesBody.children[selected].children[0].style.fontWeight = 'bolder';
    }

    function fillTable() {
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

            newRow.addEventListener('click', function() {
                prevSelected = selected;
                selected = i;
                selectRecipe(selected);
            })
            tableRecipesBody.appendChild(newRow);
    }
    }
});