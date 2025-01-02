document.addEventListener("DOMContentLoaded", function() {
    const tableRecipesBody = document.getElementById('tableRecipes').children[1];
    let data = [];

    for (let i = 0; i < tableRecipesBody.children.length; i++) {
        const row = tableRecipesBody.children[i].children;

        data[i] = {
            'name': row[0].textContent,
            'category': row[1].textContent,
            'cuisine': row[2].textContent,
            'finished': parseInt(row[3].textContent),
            'time': row[4].textContent,
            'difficulty': row[5].textContent,
            'file': row[6].textContent,
            'origin': row[7].textContent,
            'description': row[8].textContent,
            'prepTime': row[9].textContent,
            'flagLactose': row[10].textContent,
            'flagGluten': row[11].textContent,
            'flagVegetarian': row[12].textContent,
            'flagVegan': row[13].textContent
        }
    }
    
    let order = Array(data.length);
    let filteredOrder = Array(data.length);
    const fields = ['name','category','cuisine','time','difficulty'];
    let reOrder = Array(fields.length).fill(1);

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

    const tableRecipesHead = document.getElementById('tableRecipes').children[0].children[0];
    for (let i = 0; i < tableRecipesHead.children.length; i++) {
        tableRecipesHead.children[i].addEventListener('click', function() {
            orderData(i);
        })
    }
    const nameSearch = document.getElementById('nameSearch');
    nameSearch.addEventListener('keyup', function() { orderData(-1); })
    const checkboxLactose = document.getElementById('checkboxLactose');
    const checkboxGluten = document.getElementById('checkboxGluten');
    const checkboxVegetarian = document.getElementById('checkboxVegetarian');
    const checkboxVegan = document.getElementById('checkboxVegan');
    const checkboxIncomplete = document.getElementById('checkboxIncomplete');
    checkboxLactose.addEventListener('click', function() { orderData(-1); })
    checkboxGluten.addEventListener('click', function() { orderData(-1); })
    checkboxVegetarian.addEventListener('click', function() { orderData(-1); })
    checkboxVegan.addEventListener('click', function() { orderData(-1); })
    checkboxIncomplete.addEventListener('click', function() { orderData(-1); })
    orderData(0);
    selectRecipe(selected);

    const gridRecipes = document.getElementById("gridRecipes");
    populateGrid();
    const recipeIndexTable = document.getElementById("recipeIndexTable");
    const recipeIndexGrid = document.getElementById("recipeIndexGrid");
    const buttonSwitch = document.getElementById("buttonSwitch");
    let switchState = 1;
    buttonSwitch.addEventListener('click', function() {
        if (switchState === 1) {
            recipeIndexGrid.style.display = 'none'
            recipeIndexTable.style.display = 'flex'
        } else {
            recipeIndexTable.style.display = 'none'
            recipeIndexGrid.style.display = 'flex'
        }
        switchState *= -1;
    })

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

    function populateGrid() {
        // const j = 0;
        // const i = filteredOrder[j];
        // tableRecipesBody.children[prevSelected].children[0].style.fontWeight = 'normal';

        // imageRecipe.style.opacity = 0;
        // setTimeout(() => {
        //     imageRecipe.src = `../assets/img/recipes/${data[i]['file']}.jpg`;
        //     imageRecipe.onload = () => {
        //         imageRecipe.style.opacity = 1;
        //     };
        //     imageRecipe.title = data[i]['description'];
        // }, 200);
        // titleRecipe.children[0].textContent = data[i]['name']
        // titleRecipe.href = `recipes/${data[i]['file']}.html`;
        // flagDifficulty.children[0].src = `../assets/img/icons/difficulty${data[i]['difficulty']}.png`;
        // flagDifficulty.children[1].textContent = data[i]['difficulty'];
        // flagCuisine.children[0].src = `../assets/img/icons/cuisine${data[i]['cuisine']}.png`;
        // flagCuisine.children[1].textContent = data[i]['cuisine'];
        // flagCuisine.title = data[i]['origin'];
        // flagPrepTime.textContent = data[i]['prepTime'];
        // flagTotalTime.textContent = data[i]['time'];

        // tableRecipesBody.children[selected].children[0].style.fontWeight = 'bolder';

        for (let j = 0; j < filteredOrder.length; j++) {
            const i = filteredOrder[j];
            console.log(`../assets/img/recipes/${data[i]['file']}.jpg')`)
            const gridElement = document.createElement("a");
            gridElement.classList.add("gridRecipe");
            //gridElement.setAttribute("target", "_blank");
            //gridElement.setAttribute("rel", "noopener noreferrer");
            
            gridElement.href = `recipes/${data[i]['file']}.html`;
            gridElement.style.backgroundImage = `url('../assets/img/recipes/${data[i]['file']}.jpg')`;
            
            // const innerDiv = document.createElement("div");
            // // Header
            // const header = document.createElement("h3");
            // header.innerHTML = data[i]["header"];
            // innerDiv.appendChild(header);
            // // Description
            // const desc = document.createElement("p");
            // desc.classList.add("pRich")
            // desc.innerHTML = "<br>"+data[i]["desc"];
            // innerDiv.appendChild(desc);
            // // Date
            // const date = document.createElement("h5");
            // date.innerHTML = formatDate(data[i]["date"]);
            // date.setAttribute("title","The assigned date could be related to the latest major change to the project or an official date of termination");
            // innerDiv.appendChild(date);
            // // Project type icon
            // const projectType = document.createElement("div");
            // const projectTypeImage = document.createElement("img");
            // projectTypeImage.src = `../assets/img/icons/${data[i]["type"]}.png`;
            // projectTypeImage.setAttribute("title", `Project type: ${data[i]["type"]}`);
            // projectType.appendChild(projectTypeImage);
            // innerDiv.appendChild(projectType);
            // // Tools used
            // const tools = document.createElement("div");
            // for (const toolName of data[i]["tools"]) {
            //     const toolImage = document.createElement("img");
            //     toolImage.src = `../assets/img/icons/${toolName}.svg`;
            //     toolImage.setAttribute("title", `Tool employed: ${toolName}`);
            //     tools.appendChild(toolImage);
            // }
            // innerDiv.appendChild(tools);
            // gridElement.appendChild(innerDiv);
            
            // // On hover GIF
            // if (data[i]["gif"] === true) {
            //     gridElement.addEventListener('mouseenter', function() {
            //         gridElement.style.backgroundImage = `url('../assets/img/projects/preview/${data[i]["bg"]}.avif')`;
            //     });
            //     gridElement.addEventListener('mouseleave', function() {
            //         gridElement.style.backgroundImage = `url('../assets/img/projects/preview/${data[i]["bg"]}.jpg')`;
            //     });
            // };

            // // Importance feature
            // if (data[i]["importance"] === 1) {
            //     gridElement.style.border = "1px solid";
            //     gridElement.setAttribute("title","This project is important, taking days/weeks to complete.");
            // } else if (data[i]["importance"] === 2) {
            //     gridElement.style.border = "2px solid gold";
            //     gridElement.setAttribute("title","This project is very important, taking months to complete.");
            // } else if (data[i]["importance"] === 3) {
            //     gridElement.style.border = "3px solid darkred";
            //     gridElement.setAttribute("title","This is a major venture, taking years to complete.");
            // }
            gridRecipes.appendChild(gridElement);
        }
    }
    function orderData(column) {
        // Order according to clicked column
        if (column != -1) {
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
        }

        // Apply filters
        filteredOrder = order.filter(i => {
            const entry = data[i]
            return (
                (nameSearch.value === 'Search by name' || entry.name.toLowerCase().includes(nameSearch.value.toLowerCase())) &&
                !(checkboxLactose.checked && entry.flagLactose !=='True') &&
                !(checkboxGluten.checked && entry.flagGluten !=='True') &&
                !(checkboxVegetarian.checked && entry.flagVegetarian !=='True') &&
                !(checkboxVegan.checked && entry.flagVegan !=='True') &&
                !(checkboxIncomplete.checked == entry.finished)
            );
        });

        fillTable();

        // selected = 0;
        // prevSelected = 0;
        // selectRecipe(selected);
    }

    function selectRecipe(j) {
        const i = filteredOrder[j];
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
        for (let j = 0; j < filteredOrder.length; j++) {
            const i = filteredOrder[j];
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