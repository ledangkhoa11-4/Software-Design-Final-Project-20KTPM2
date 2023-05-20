function searchCalories(t,e) {
    let value = t.value
    let tooltipWrapper = t.parentNode.parentNode.querySelector(".wrapper")
    let tooltipContent = tooltipWrapper.querySelector(".tooltip")
    let key_api = "5a0114020a82747448a4545a0abf0e36"
    let app_id = "0d96c96a"
    if(value.length <= 0){
        return tooltipWrapper.classList.add("hidden");
    }else{
        tooltipWrapper.classList.remove("hidden")
        let ingr = `100 g ${value}`
        ingr = ingr.replaceAll(" ","%20")
        
       
        $.get(`https://api.edamam.com/api/nutrition-data?app_id=${app_id}&app_key=${key_api}&ingr=${ingr}`, function(data, status){
            let calories = data.calories
            if(calories != 0){
                tooltipContent.textContent = `According to EdamamAPI, in 100gr of your ingredient has ${calories} Calories`
                return tooltipWrapper.classList.remove("hidden");
            }else{
                $.get(`https://api.mymemory.translated.net/get?q=${value}&langpair=vi|en`, function(data, status){
                    let matchList = data.matches
                    if(matchList.length <= 0) return
                    let translatedValue
                    if(matchList.length >= 2)
                        translatedValue = matchList[1].translation
                    else
                        translatedValue = matchList[0].translation
                    console.log(translatedValue)
                    ingr = `100 g ${translatedValue}`
                     $.get(`https://api.edamam.com/api/nutrition-data?app_id=${app_id}&app_key=${key_api}&ingr=${ingr}`, function(dataCalo, status){
                        
                        let calories = dataCalo.calories
                        if(calories != 0){
                        tooltipContent.textContent = `According to EdamamAPI, in 100gr of your ingredient has ${calories} Calories`
                        return tooltipWrapper.classList.remove("hidden");
                    }else{
                        tooltipContent.textContent = `We cannot finding energy of this food!`
                    }
                    })
                })
            }
        });
    }
}
