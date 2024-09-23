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
    let order = Array(data.length);
    const fields = ['name','category','cuisine','finished','time','difficulty'];
    let reOrder = Array(fields.length).fill(1);

    let selected;
    let prevSelected;
    const imageRecipe = document.getElementById('imageRecipe');
    const titleRecipe = document.getElementById('titleRecipe');
    const buttonPrevRecipe = document.getElementById('buttonPrevRecipe');
    const buttonNextRecipe = document.getElementById('buttonNextRecipe');
    const flagDifficulty = document.getElementById('flagDifficulty');
    const flagCuisine = document.getElementById('flagCuisine');
    const flagPrepTime = document.getElementById('flagPrepTime');
    const flagTotalTime = document.getElementById('flagTotalTime');

    const tableRecipesHead = document.getElementById('tableRecipes').children[0].children[0];
    for (let i = 0; i < tableRecipesHead.children.length; i++) {
        tableRecipesHead.children[i].addEventListener('click', function() {
            orderData(i);
        })
    }
    orderData(0); 

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

    function orderData(column) {
        const field = fields[column];
        
        if (field === 'difficulty') {
            func = function(x) { 
                if (x === 'Very easy') { return 0; 
                } else if (x === 'Easy') { return 1;
                } else if (x === 'Medium') { return 2;
                } else { return 3; }
            }
        } else if (field === 'time') {
            func = function(x) {
                let count = 0;
                
                const parts = x.split(' ');
                for (let i=0; i<parts.length; i++) {
                    const number = parseInt(parts[i].match(/\d+/)[0]);
                    if (parts[i].includes('d')) {
                        count += number*1440;
                    } else if (parts[i].includes('h')) {
                        count += number*60;
                    } else {
                        count += number;
                    }
                }
                return count;
            }
        } else {
            func = function(x) { return String(x); }
        }
        const orderList = data.map((item, index) => ({ value: func(item[field]), index: index }));
        
        order = orderList
            .sort((a, b) => {
                let comparison;
                if (typeof a.value === 'string') { comparison = reOrder[column]*a.value.localeCompare(b.value);
                } else {
                    comparison = reOrder[column] * (a.value - b.value);
                }

                if (comparison == 0) { comparison = a.index - b.index; }
                return comparison
            })
            .map(item => item.index);
        
        reOrder[column] *= -1;

        fillTable();

        selected = 0;
        prevSelected = 0;
        selectRecipe(selected);
    }

    function selectRecipe(j) {
        const i = order[j];
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
        for (let j = 0; j < order.length; j++) {
            const i = order[j];
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
                selected = j;
                selectRecipe(selected);
            })
            tableRecipesBody.appendChild(newRow);
    }
    }
});