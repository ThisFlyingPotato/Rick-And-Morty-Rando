/**
 * functions list :
 * -randomPageIndexGenerator()
 * -randomNumberGenerator()
 * -requestCharacters()
 * -ensureNoDuplicate()
 * -buildCard()
 * -buildAllCards()
 * -attachCardEventListener()
 * -buildModal()
 * -openModal()
 * -closeModal()
 * -attachEventListenerOnStatusButtons()
 * -attachEventListenerOnScrollUpPicture()
 * -main()
 */



/**
 * Episode Object
 * 
 * WARNING : entry point is unusual => DO NOT instanciate using new Episode(), instead use the provided constructor : initialize()
 * Why ? This is because the instantiation is async due to the fetch, and implementing it any other way would be a mess.
 * For further explanation, I recommend this article on why this is the best implementation : https://dev.to/somedood/the-proper-way-to-write-async-constructors-in-javascript-1o8c
 * 
 * The purpose of this object is to fetch and store a well formatted episode name from the API using an url
 * 
 */
class Episode{
    #fullName //a well formatted episode name

    /**
     * @private
     * do **NOT** use as a constructor, if you do, bad things will happen.
     * if JS allowed it, I'd have made it private...
     * @param {*} data 
     */
    constructor(data){
        /*  
            TODO : make it so if one tries to use the contructor, the following executes
            throw new Error('This constructor is private, please use initialize(status,page,index) method instead')
        */
        this.#fullName=data['episode'] + ' - ' + data['name']
    }
    /**
     * The actual constructor of the object, use this to instantiate one.
     * @async
     * @public
     * @param {*} url 
     * @returns {new Episode} instantiate a new Episode with already fetched and ready to use data
     */
    static async initialize(url){
        let redoStatement=false
        let maxRetry=50
        let response
        let data
        do{
            try {
                response = await fetch(url)
                if(!response.ok){throw new Error("Response for an Episode fetch wasn't OK. Retrying (forever, and ever) until it works.")}
                data = await response.json()
            } catch (error) {
                console.error(error)
                redoStatement=true
                maxRetry--
            }
        }while(redoStatement || !maxRetry)
        return new Episode(data)
    }
    getFullName(){
        return this.#fullName
    }
}


/**
 * Episode Object
 * 
 * WARNING : entry point is unusual => DO NOT instanciate using new Episode(), instead use the provided constructor : initialize()
 * Why ? This is because the instantiation is async due to the fetch, and implementing it any other way would be a mess.
 * For further explanation, I recommend this article on why this is the best implementation : https://dev.to/somedood/the-proper-way-to-write-async-constructors-in-javascript-1o8c
 * 
 * The purpose of this object is to fetch and store a character's data from the API using a status (alive, dead, etc) and a location (a page and an index)
 * 
 */
class Character{
    #imageUrl
    #name
    #status
    #gender
    #specie
    #origin
    #location
    #episodeUrls
    #episodeFullNames

    /**
     * @private
     * do **NOT** use as a constructor, if you do, bad things will happen.
     * if JS allowed it, I'd have made it private...
     * @param {*} data used to initialize the private variables above
     * @param {*} index used to select the correct Character from where to pull the data
     */
    constructor(data,index){
        /*  
            TODO : make it so if one tries to use the contructor, the following executes
            throw new Error('This constructor is private, please use initialize(status,page,index) method instead')
        */
        this.#imageUrl=data['results'][index]['image']
        this.#name=data['results'][index]['name']
        this.#status=data['results'][index]['status']
        this.#gender=data['results'][index]['gender']
        this.#specie=data['results'][index]['species']
        this.#origin=data['results'][index]['origin']['name']
        this.#location=data['results'][index]['location']['name']
        this.#episodeUrls=data['results'][index]['episode']
    }
    /**
     * The actual constructor of the object, use this to instantiate one.
     * @async
     * @public
     * @param {string} status status of the requested Character, valids status are "all","alive","dead", and "unknown", is used to generate the url
     * @param {int} page the page of where to find the requested Character, is used to generate the url
     * @param {int} index index within a page of where to find the requested Character
     * @returns {new Character} instantiate a new Character with already fetched and ready to use data
     */
    static async initialize(status,page,index){
        let url= status==="all" ? `https://rickandmortyapi.com/api/character/?page=${page}` : `https://rickandmortyapi.com/api/character/?status=${status}&page=${page}`
        // let url= `https://rickandmortyapi.com/api/character/?species=Mythological`

        let redoStatement=false
        let maxRetry=50
        let response
        let data
        do{
            try {
                response = await fetch(url)
                if(!response.ok){throw new Error("Response for an Episode fetch wasn't OK. Retrying (forever, and ever) until it works.")}
                data = await response.json()
            } catch (error) {
                console.error(error)
                redoStatement=true
                maxRetry--
            }
        }while(redoStatement || !maxRetry)
        
        return new Character(data,index)
    }

    /**
     * getter methods
     * @returns {string} their respective private variable
     */
    getImageUrl(){return this.#imageUrl}
    getName(){return this.#name}   
    getStatus(){return this.#status}   
    getGender(){return this.#gender}   
    getSpecie(){return this.#specie}   
    getOrigin(){return this.#origin}    
    getLocation(){return this.#location}   


    /**
     * getEpisodeFullNames()
     * This method uses the array of URLs for the episodes in which the Character has been featured, to create Episode objects that can translate the URLs into well formated episode names.
     * To reduce usuless fetches, it is only called when needed for a modal, and also store the array of episode names to avoid further fetches.
     * @async
     * @public
     * @returns {Array of string}
     */
    async getEpisodeFullNames(){
        if(this.#episodeFullNames===undefined){
            this.#episodeFullNames=[]

            let tempArray=[]
            this.#episodeUrls.forEach(url => {
                tempArray.push(Episode.initialize(url))
            })
            tempArray = await Promise.all(tempArray)

            tempArray.forEach(episode => {
                this.#episodeFullNames.push(episode.getFullName())
            });
        }
        return this.#episodeFullNames
    }
}



/**
 * @generator Generate randomply picked {page,index} pairs
 * @param {string} status status of the requested characters (dead, alive, unknown, or all)
 * @param {int} charactersRequested will generate this number of "Locations" from which to fetch Characters data
 * @param {array of {key,value}} notAllowed when randomly picking a page and index, if the {key,value} is present in this array, it will pick another one. Store every {key,value} and is primordial in dupplicate avoidance.
 * @returns {array of {key,value}} a set of unique {key,value}, quantity is determined by `characterRequested`
 */
function randomPageIndexGenerator(status,charactersRequested,notAllowed){
    pagesWithTheirIndexes=[]
    let needAnotherValue
    let elementsPerPage = 20
    let minNumber=1
    let maxNumber
    switch (status){
        case 'dead':    maxNumber=287;  break
        case 'alive':   maxNumber=439;  break
        case 'unknown': maxNumber=100;  break
        case 'all':     maxNumber=826;  break
        default:throw new Error("Default has been reached on randomPageIndexGenerator(), please use a valid status.");
    }

    
    while(pagesWithTheirIndexes.length<charactersRequested){

        let rand = randomNumberGenerator(minNumber,maxNumber)
        let page = Math.ceil(rand / elementsPerPage)
        let index = (rand + (elementsPerPage - 1)) %elementsPerPage
        
        needAnotherValue=false
        notAllowed.forEach(element => {
            if(element['page']===page && element['index']===index){
                needAnotherValue=true
            }
        });

        if(!needAnotherValue){
            pagesWithTheirIndexes.push({'page':page,'index':index})
            notAllowed.push({'page':page,'index':index})
        }

    }
    return pagesWithTheirIndexes
}

/**
 * @generator Simple function that randomly generate a integer between (both included) a minimum and maximum value
 * @param {int} minNumber 
 * @param {int} maxNumber 
 * @returns {int} a random number between minNumber and maxNumber
 * The results is then used by randomPageIndexGenerator to create a {page,index} pair.
 */
function randomNumberGenerator(minNumber,maxNumber){
    return Math.floor(Math.random()*(maxNumber+1-minNumber)+minNumber)
}


/**
 * This recursive function request the specified number of characters then return the Character objects in an array, making sure no dupplicate are present in the array before returning it.
 * @param {string} status 
 * @param {int} charactersRequested 
 * @param {array of {key,value}} notAllowedPageIndexPair will not attempt to generate a new Character from those values : it is filled with value that made 1) already generated Characters, 2) generated Character that turned out to be dupplicates and never got added to the noDupplicateHere array.
 * @param {array of Character objects} noDuplicateHere you'd have to be absolutely unique to make it there.
 * @returns {array of Character objects} returns noDupplicateHere
 */
async function requestCharacters(status,charactersRequested,notAllowedPageIndexPair=[],noDuplicateHere=[]){
    let characters=[]
    let currentPageIndexPair=randomPageIndexGenerator(status,charactersRequested-noDuplicateHere.length,notAllowedPageIndexPair)
    
    currentPageIndexPair.forEach(element => {
        notAllowedPageIndexPair.push(element)
        characters.push(Character.initialize(status,element['page'],element['index']))
    });
    characters = await Promise.all(characters)

    noDuplicateHere = ensureNoDuplicate(characters,noDuplicateHere)
    if(noDuplicateHere.length<charactersRequested){
        noDuplicateHere = requestCharacters(status,charactersRequested,notAllowedPageIndexPair,noDuplicateHere)
    }
    return noDuplicateHere
}
/**
 * This function pushes characters into a list where we are 100% sure there are no dupplicate, checks are done before each push, if there is a dupplicate the push doesn't happen
 * @param {array of Character objects} characters characters list to compare to itself (and the noDuplicateHere list if present) to make sure there is no dupplicates
 * @param {array of Character objects} noDuplicateHere are stored there only characters where we are 100% positive they are unique.
 * @returns {array of Character objects} returns noDuplicateHere
 */
function ensureNoDuplicate(characters,noDuplicateHere){

    let name
    let status
    let gender
    let specie
    let origin
    let location
    let startIndex=0
    
    if(noDuplicateHere.length===0){
        noDuplicateHere.push(characters[0])
        startIndex=1
    }
    for(let i=startIndex;i<characters.length;i++){
        
        characterIsUnique=true
        
        name=characters[i].getName()
        status=characters[i].getStatus()
        gender=characters[i].getGender()
        specie=characters[i].getSpecie()
        origin=characters[i].getOrigin()
        location=characters[i].getLocation()

        for(let j=0;j<noDuplicateHere.length;j++){
            if( name===noDuplicateHere[j].getName() 
                && status===noDuplicateHere[j].getStatus() 
                && gender===noDuplicateHere[j].getGender() 
                && specie===noDuplicateHere[j].getSpecie() 
                && origin===noDuplicateHere[j].getOrigin() 
                && location===noDuplicateHere[j].getLocation()
            ){
                characterIsUnique=false
            }
        }
        if(characterIsUnique){
            noDuplicateHere.push(characters[i])
        }
    }


    return noDuplicateHere
}

/**
 * Creates elements, fills them with appropriate data, add some styles to them, then structure them and insert them into the DOM. On top of that add corresponding eventListenders
 * Creates a character card on the browser, that once clicked will fetch the remaining data, create and open a modal for extened information on the character
 * @param {Character object} character 
 * @returns {void}
 */
function buildCard(character){

    //generating card elements
    let cardContainer=document.createElement("div")
        let imgContainer=document.createElement("img")
        let textContainer=document.createElement("div")
            let textName=document.createElement("h2")
            let statusContainer=document.createElement("div")
                let statusDot=document.createElement("span")
                let statusText=document.createElement("span")
            let textGender=document.createElement("span")
            let textSpecie=document.createElement("span")

    //filling elements with character's data
    imgContainer.src=character.getImageUrl()
    imgContainer.alt=character.getName()
    textName.textContent=character.getName()
    statusDot.textContent="•"
    statusText.textContent=character.getStatus()
    textGender.textContent=character.getGender()
    textSpecie.textContent=character.getSpecie()

    
    //filling elements with classes
    //Finding this eye watering ? this is only a card, can't wait to present to you the modal creation :)
    cardContainer.classList="h-fit lg:h-44 overflow-hidden flex flex-col lg:flex-row bg-gray-900 rounded-3xl cursor-pointer"
    textContainer.classList="w-full overflow-hidden mx-2 flex flex-col justify-evenly items-center text-2xl text-white break-words font-cartoon text-center"
    textName.classList="w-full self-center overflow-hidden text-ellipsis text-nowrap font-normal text-3xl font-sans text-center"
    
    switch (character.getStatus()){
        case "Dead":statusContainer.classList.add("text-beth_red");break;
        case "Alive":statusContainer.classList.add("text-portal_green");break;
        case "unknown":statusContainer.classList.add("text-morty_yellow");break;
        default:throw new error("Reached default of switch for status in buildCard")
    }

    switch(character.getGender()){
        case "Male":textGender.classList.add("text-rick_blue");break;
        case "Female":textGender.classList.add("text-summer_pink");break;
        default:textGender.classList.add("text-white")

    }

    textSpecie.classList.add("text-2xl")
    
    //ELEMENTS ! .... [Thor's Hammer sound effet] .. ASSEMBLE. MUAAAAAAAAAAAAAAAAAAHHHHHH !!!
    statusContainer.appendChild(statusDot)
    statusContainer.appendChild(statusText)

    textContainer.appendChild(textName)
    textContainer.appendChild(statusContainer)
    textContainer.appendChild(textGender)
    textContainer.appendChild(textSpecie)

    cardContainer.appendChild(imgContainer)
    cardContainer.appendChild(textContainer)

    document.querySelector("#cardsWrapper").appendChild(cardContainer)
    
    attachCardEventListener(character,cardContainer)

    return 


}

/**
* We've seen how to build a card, this is the general function that manage everything !
 * 1) generate characters
 * 2) clears the content of the cardWarper to make room for the future cards
 * 3) build a card for every character requested.
 * @async
 * @param {string} status 
 * @param {int} charactersRequested 
 * @returns {void}
 */
async function buildAllCards(status,charactersRequested){

    let characters=await requestCharacters(status,charactersRequested)
    document.querySelector("#cardsWrapper").innerHTML=''
    characters.forEach(character => {buildCard(character)});

    return
}

/**
 * Simple function that adds and event Listener onto a card, making it so that a click on the card triggers a modal creation and oppening
 * @param {Character object} character 
 * @param {DOM element} cardContainer 
 * @returns 
 */
function attachCardEventListener(character,cardContainer){
    cardContainer.addEventListener("click",async()=>{
        // await buildModal(character)
        buildModal(character)
        openModal()
    })
    return
}

/**
 * Uses the Character object to create and build a modal to get extented info on a character. Also attach an eventListener that will delete the modal upon a clic outside and on the close or on the close button
 * @param {Character object} character 
 * @returns {void}
 */
async function buildModal(character){
    let episodeListText=await character.getEpisodeFullNames()
    let episodeListElements=[]
    
    //generate elements (this is the future structure)
    let modalWrapper                        =document.createElement("div")
    let     modalContainer                  =document.createElement("div")
    let         textName                    =document.createElement("h2")
    let         fancySeparator              =document.createElement("span")
    let         pictureAndInfoContainer     =document.createElement("div")
    let             picture                 =document.createElement("img")
    let             infoContainer           =document.createElement("div")
    let                 firstSeenTitle      =document.createElement("h3")
    let                 firstSeenLocation   =document.createElement("span")
    let                 lastSeenTitle       =document.createElement("h3")
    let                 lastSeenLocation    =document.createElement("span")
    let                 episodeListTitle    =document.createElement("h3")
    let                 episodesContainer   =document.createElement("ul")
                            episodeListText.forEach(episode => {
                                episodeListElements.push(document.createElement("li")) 
                            });
    let             btnClose                =document.createElement("button")


    //fill elements with appropriate data
    textName.textContent=character.getName()
    picture.src=character.getImageUrl()
    picture.alt=character.getName()
    firstSeenTitle.textContent="First seen at"
    firstSeenLocation.textContent=character.getOrigin()
    lastSeenTitle.textContent="Last seen at"
    lastSeenLocation.textContent=character.getLocation()
    episodeListTitle.textContent="Appears in"
    

    episodeListText.forEach((episode,index) => {
        episodeListElements[index].textContent=episode
    });

    btnClose.textContent="Close"

    
    //add styles to elements
    //Good luck reading all that. If you need me I'll be over there cleaning my eyes with bleach
    modalWrapper.classList="hidden w-full h-full bg-black bg-opacity-30 top-0 left-0 fixed flex justify-center items-center"
    modalContainer.classList="w-2/3 py-4 h-fit bg-gray-800 text-white rounded-lg flex flex-col items-center gap-8"
    textName.classList="font-cartoon text-5xl lg:text-7xl flex justify-center text-center text-gray-100"
    fancySeparator.classList="w-3/4 border-b-[1px] border-gray-600 border-bottom"
    pictureAndInfoContainer.classList="w-full flex flex-col lg:flex-row px-4 justify-center h-auto text-2xl"
    picture.classList="rounded self-center ml-1 [margin-top:7px] w-[55%]"
    infoContainer.classList="h-full w-full pl-9 flex flex-col items-center lg:items-start"
    firstSeenTitle.classList="font-bold text-center lg:text-left"
    firstSeenLocation.classList="text-portal_green ml-4 text-3xl text-center lg:text-left"
    lastSeenTitle.classList="font-bold text-center lg:text-left"
    lastSeenLocation.classList="ml-4 text-3xl text-center lg:text-left"
    switch (character.getStatus()){
        case "unknown":lastSeenLocation.classList.add("text-morty_yellow");break;
        case "Alive":lastSeenLocation.classList.add("text-portal_green");break;
        case "Dead":lastSeenLocation.classList.add("text-beth_red");break;
        default:throw new Error('Reached default in status switch in buildModal() status is : '+ character.getStatus())
    }
    episodeListTitle.classList="font-bold text-center lg:text-left"
    episodesContainer.classList="mt-3 max-h-52 rounded-lg overflow-auto w-full"

    episodeListElements.forEach((element,index) => {
        if(index%2===0){
            element.classList="bg-shades_of_grey-ligthest text-black p-1 pl-2 text-center lg:text-left"
        }else{
            element.classList="bg-shades_of_grey-ligth p-1 pl-2 text-center lg:text-left"
        }
    });

    btnClose.classList="self-center w-9/12 py-3 rounded-md bg-gray-400 text-4xl font-bold uppercase hover:bg-beth_red"

    
    
    //ELEMENTS ! .... [Thor's Hammer sound effet] .. ASSEMBLE. MUAAAAAAAAAAAAAAAAAAHHHHHH !!!
    episodeListElements.forEach(element => {
        episodesContainer.appendChild(element)
    });
    


    infoContainer.appendChild(firstSeenTitle)
    infoContainer.appendChild(firstSeenLocation)
    infoContainer.appendChild(lastSeenTitle)
    infoContainer.appendChild(lastSeenLocation)
    infoContainer.appendChild(episodeListTitle)
    infoContainer.appendChild(episodesContainer)

    pictureAndInfoContainer.appendChild(picture)
    pictureAndInfoContainer.appendChild(infoContainer)
    

    modalContainer.appendChild(textName)
    modalContainer.appendChild(fancySeparator)
    modalContainer.appendChild(pictureAndInfoContainer)
    modalContainer.appendChild(btnClose)


    modalWrapper.appendChild(modalContainer)
    document.body.appendChild(modalWrapper)
    
    modalWrapper.id     ="modalWrapper"
    modalContainer.id   ="modalContainer"
    btnClose.id         ="btnClose"

    modalWrapper.addEventListener("click",(event)=>{
        if((event.target.offsetParent!==document.querySelector("#modalContainer").offsetParent||event.target.id==="btnClose")){
            closeModal()
        }
    })

    return
}

/**
 * hard to to a simpler function : this remove the hidden class on the modal and makes it visible
 * @returns {void}
 */
function openModal(){
    document.querySelector("#modalWrapper").classList.remove("hidden")
    return
}

/**
 * turns out you can do simpler ! this removes the modal wrapper, and by consequence all of it's children and the eventlister attached to it
 * @returns {void}
 */
function closeModal(){
    document.querySelector("#modalWrapper").remove()
    return
}


/**
 * Attach eventListeners on the Alive Dead Unknown and All buttons at the top of the page, bind them so a click on the button will request and build the appropriate characters cards
 * @returns {void}
*/
function attachEventListenerOnStatusButtons(){
    document.querySelector("#btnAlive").addEventListener("click",async()=>{buildAllCards("alive",12)})
    document.querySelector("#btnDead").addEventListener("click",async()=>{buildAllCards("dead",12)})
    document.querySelector("#btnUnknown").addEventListener("click",async()=>{buildAllCards("unknown",12)})
    document.querySelector("#btnAll").addEventListener("click",async()=>{buildAllCards("all",12)})
    return
}

/**
 * attach an eventListner on the (hidden for large enough screen) butter robot (yeah I know it sounds weird) so that a click on it scrolls the page to the nearly top (and have the request buttons in view) 
 * @returns {void}
 */
function attachEventListenerOnScrollUpPicture(){
    document.querySelector("#btnGoUp").addEventListener("click",()=>{
        document.querySelector("#btnUnknown").scrollIntoView({behavior:"smooth",block:"center"})
    })
    return
}
/**
 * The main function, filled with soooo many func.. oh wait only 3.
 * first 2 attach eventListeners on the request buttons and the robot
 * last one request randomly choosen characters so the user lands on an already populated page.
 * @async
 * @returns {void}
 */
async function main(){  
    attachEventListenerOnStatusButtons()
    attachEventListenerOnScrollUpPicture()
    buildAllCards("all",12)

    return
}


main()
