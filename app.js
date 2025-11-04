class EmojiEncyclopedia {
  constructor() {
    this.emojis = []
    this.filteredEmojis = []
    this.currentCategory = "all"
    this.previousCategory = "all"
    this.searchTimeout = null

    this.init()
  }

  async init() {
    await this.loadEmojis()
    this.setupEventListeners()
    this.renderEmojis()
  }

  async loadEmojis() {
    console.log("🚀 Starting to load emoji data...")

    try {
      // Load emoji data from JSON file
      console.log("📡 Fetching emojis.json...")
      const response = await fetch("emojis.json")

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      console.log("✅ Successfully fetched JSON, parsing...")
      const emojiData = await response.json()
      console.log("📊 JSON parsed successfully:", emojiData)

      // Parse the nested JSON structure: categories -> subcategories -> emojis
      this.emojis = []
      const categories = emojiData.emojis || emojiData

      console.log(`📂 Found ${Object.keys(categories).length} categories:`, Object.keys(categories))

      Object.entries(categories).forEach(([category, subcategories]) => {
        console.log(`📁 Processing category: ${category}`)
        let categoryCount = 0

        Object.entries(subcategories).forEach(([subcategory, emojiList]) => {
          console.log(`  📄 Processing subcategory: ${subcategory} (${emojiList.length} emojis)`)

          emojiList.forEach(emoji => {
            this.emojis.push({
              ...emoji,
              group: category,
              subcategory: subcategory,
              keywords: this.generateKeywords(emoji.name, category),
              description: this.generateDescription(emoji.name),
              usage: this.generateUsage(emoji.name, category),
            })
            categoryCount++
          })
        })

        console.log(`✅ Category ${category} loaded: ${categoryCount} emojis`)
      })

      console.log(`🎉 Successfully loaded ${this.emojis.length} total emojis from ${Object.keys(categories).length} categories`)

      // Log category counts for debugging
      const categoryCounts = {}
      this.emojis.forEach(emoji => {
        categoryCounts[emoji.group] = (categoryCounts[emoji.group] || 0) + 1
      })
      console.log("📊 Emoji count by category:", categoryCounts)

    } catch (error) {
      console.error("❌ Error loading emojis:", error)
      console.log("⚠️ Using fallback emoji set due to loading error")

      // Show user-friendly error message
      const loadingEl = document.getElementById("loading")
      if (loadingEl) {
        loadingEl.innerHTML = `
          <div style="text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
            <h3>Failed to load emoji data</h3>
            <p>Using limited emoji set. Please ensure the server is running.</p>
            <p style="font-size: 0.8rem; opacity: 0.7;">Error: ${error.message}</p>
          </div>
        `
      }

      // Fallback to a minimal set if JSON fails to load
      this.emojis = [
        { emoji: "😀", name: "grinning face", group: "Smileys & Emotion" },
        { emoji: "❤️", name: "red heart", group: "Smileys & Emotion" },
        { emoji: "🍕", name: "pizza", group: "Food & Drink" },
        { emoji: "🐶", name: "dog face", group: "Animals & Nature" },
        { emoji: "🚗", name: "automobile", group: "Travel & Places" },
        { emoji: "⚽", name: "soccer ball", group: "Activities" },
        { emoji: "📱", name: "mobile phone", group: "Objects" },
        { emoji: "🇺🇸", name: "flag united states", group: "Flags" },
      ].map((emoji) => ({
        ...emoji,
        keywords: this.generateKeywords(emoji.name, emoji.group),
        description: this.generateDescription(emoji.name),
        usage: this.generateUsage(emoji.name, emoji.group),
      }))
    }

    this.filteredEmojis = [...this.emojis]
    document.getElementById("loading").style.display = "none"
    document.getElementById("emojiGrid").style.display = "grid"
  }

  generateKeywords(name, group) {
    const keywords = [name.toLowerCase()]
    const nameLower = name.toLowerCase()

    // Add name-based keywords (split words)
    const words = nameLower.split(/[\s-_]+/)
    keywords.push(...words)

    // COMPREHENSIVE EMOJI MAPPING - Common words people search for
    const commonEmojiMap = {
      // Explosions and destruction
      "bomb": ["explosion", "explode", "bomb", "blow up", "destroy", "blast", "dynamite", "tnt"],
      "collision": ["crash", "accident", "collision", "boom", "bang", "impact", "hit"],
      "exploding head": ["mind blown", "explode", "exploding", "shocked", "wow", "amazing", "unbelievable"],
      "face with symbols on mouth": ["cursing", "swearing", "bad words", "angry", "mad", "rage"],

      // Emotions
      "grinning face": ["happy", "smile", "cheerful", "glad", "joy", "excited"],
      "grinning face with big eyes": ["happy", "smile", "excited", "surprised", "wow"],
      "grinning face with smiling eyes": ["happy", "smile", "pleased", "content", "glad"],
      "beaming face with smiling eyes": ["happy", "smile", "excited", "joy", "proud"],
      "grinning squinting face": ["happy", "smile", "laugh", "excited", "joy"],
      "grinning face with sweat": ["nervous", "sweat", "anxious", "relieved", "phew"],
      "rolling on the floor laughing": ["lol", "lmao", "rofl", "laughing", "hilarious", "dying laughing"],
      "face with tears of joy": ["laughing", "crying laughing", "lol", "funny", "haha"],
      "slightly smiling face": ["smile", "happy", "content", "pleased", "subtle smile"],
      "upside-down face": ["silly", "goofy", "playful", "joking", "weird"],
      "winking face": ["wink", "flirt", "joke", "teasing", "playful"],
      "smiling face with smiling eyes": ["happy", "smile", "warm", "friendly", "kind"],
      "smiling face with halo": ["angel", "innocent", "good", "perfect", "halo"],
      "smiling face with hearts": ["love", "in love", "adoration", "crush", "infatuated"],
      "smiling face with tear": ["proud", "touched", "emotional", "moved", "happy tears"],
      "zany face": ["goofy", "silly", "crazy", "wacky", "funny"],
      "grinning face with sunglasses": ["cool", "awesome", "shades", "sunglasses", "swag"],

      // Love and affection
      "face blowing a kiss": ["kiss", "blowing kiss", "mwah", "love", "affection"],
      "kissing face": ["kiss", "love", "romance", "affection", "xoxo"],
      "kissing face with smiling eyes": ["happy kiss", "love", "romance", "sweet"],
      "kissing face with closed eyes": ["passionate kiss", "love", "romance", "intimate"],
      "hugging face": ["hug", "cuddle", "embrace", "love", "affection"],
      "beating heart": ["heartbeat", "love", "crush", "excited", "heart beating"],
      "heart on fire": ["burning love", "passion", "desire", "intense love"],
      "revolving hearts": ["love", "romance", "dating", "relationship", "couple"],
      "two hearts": ["love", "romance", "double love", "couple", "relationship"],
      "sparkling heart": ["sparkly", "magical", "love", "special", "beautiful"],

      // Sad and negative emotions
      "loudly crying face": ["crying", "sobbing", "very sad", "tears", "upset"],
      "face crying": ["crying", "sad", "tears", "upset", "emotional"],
      "sad but relieved face": ["relieved", "mixed feelings", "conflicted", "unsure"],
      "pensive face": ["thinking", "pensive", "thoughtful", "contemplative"],
      "disappointed face": ["disappointed", "sad", "let down", "bummed"],
      "worried face": ["worried", "anxious", "concerned", "nervous"],
      "angry face": ["angry", "mad", "upset", "annoyed", "furious"],
      "pouting face": ["pouting", "sulking", "grumpy", "unhappy"],
      "face with steam from nose": ["angry", "furious", "mad", "rage", "pissed off"],

      // Surprise and shock
      "astonished face": ["shocked", "amazed", "astonished", "wow", "surprised"],
      "flushed face": ["embarrassed", "blushing", "shy", "flustered"],
      "pleading face": ["please", "begging", "puppy eyes", "pleading"],
      "face with monacle": ["rich", "fancy", "classy", "monacle", "wealthy"],
      "star-struck": ["starstruck", "amazed", "celebrity", "fan", "wow"],

      // Thinking and confusion
      "thinking face": ["thinking", "pondering", "wondering", "considering"],
      "face with raised eyebrow": ["skeptical", "doubtful", "questioning", "suspicious"],
      "face with diagonal mouth": ["confused", "uncertain", "unsure", "what"],
      "face with hand over mouth": ["shocked", "surprised", "gasp", "oops"],
      "shushing face": ["shh", "quiet", "silence", "secret", "hush"],
      "face with finger on mouth": ["shh", "thinking", "contemplating", "hmm"],

      // Sleep and tired
      "sleeping face": ["sleeping", "tired", "sleepy", "nap", "night"],
      "sleepy face": ["tired", "sleepy", "exhausted", "yawning"],
      "drooling face": ["drooling", "hungry", "delicious", "wanting"],
      "yawning face": ["yawning", "tired", "sleepy", "bored"],

      // Unwell and sick
      "nauseated face": ["nauseous", "sick", "queasy", "unwell", "gross"],
      "face with thermometer": ["sick", "fever", "ill", "temperature"],
      "face with head-bandage": ["injured", "hurt", "headache", "bandaged"],
      "woozy face": ["dizzy", "drunk", "woozy", "confused"],

      // Activities and actions
      "face with party horn": ["celebration", "party", "yay", "excited", "popper"],
      "partying face": ["party", "celebrating", "fun", "dancing", "music"],
      "singing face": ["singing", "music", "song", "karaoke", "voice"],
      "speaking head": ["talking", "speaking", "conversation", "chat"],
      "bored face": ["bored", "uninterested", "blah", "meh"],
      "saluting face": ["salute", "respect", "military", "honor"],

      // Money and objects
      "money-mouth face": ["rich", "money", "wealthy", "expensive"],
      "hot face": ["hot", "spicy", "warm", "temperature"],
      "cold face": ["cold", "freezing", "chilly", "winter"],

      // Nature elements
      "sun": ["sunny", "bright", "warm", "daylight", "shine"],
      "moon": ["night", "sleepy", "dark", "bedtime"],
      "star": ["star", "celestial", "night sky", "sparkle"],
      "cloud": ["cloudy", "weather", "sky", "rain"],
      "rainbow": ["rainbow", "colorful", "pride", "gay"],
      "fire": ["hot", "flame", "burning", "passion"],
      "water wave": ["ocean", "sea", "beach", "water"],

      // Animals
      "dog": ["puppy", "canine", "pet", "bark", "woof"],
      "cat": ["kitten", "feline", "pet", "meow", "purr"],
      "mouse": ["mouse", "rodent", "small", "cheese"],
      "hamster": ["hamster", "pet", "cute", "rodent"],
      "rabbit": ["bunny", "rabbit", "pet", "cute", "hop"],
      "fox": ["fox", "clever", "sly", "wild"],
      "bear": ["bear", "wild", "strong", "hug"],
      "panda": ["panda", "cute", "china", "bamboo"],
      "koala": ["koala", "cute", "australia", "eucalyptus"],
      "tiger": ["tiger", "stripes", "wild", "roar"],
      "lion": ["lion", "king", "wild", "roar"],
      "cow": ["cow", "moo", "farm", "milk"],
      "pig": ["pig", "oink", "farm", "pink"],
      "frog": ["frog", "ribbit", "green", "hop"],
      "monkey": ["monkey", "banana", "tree", "wild"],
      "chicken": ["chicken", "egg", "farm", "cluck"],
      "penguin": ["penguin", "arctic", "cold", "waddle"],
      "bird": ["bird", "flying", "tweet", "chirp"],
      "baby chick": ["chick", "baby bird", "cute", "yellow"],
      "hatching chick": ["hatching", "birth", "new", "baby"],
      "duck": ["duck", "quack", "water", "yellow"],
      "eagle": ["eagle", "majestic", "flying", "bird of prey"],
      "owl": ["owl", "wise", "night", "hoot"],
      "bat": ["bat", "night", "vampire", "flying"],
      "wolf": ["wolf", "howl", "wild", "pack"],
      "boar": ["boar", "wild", "pig", "forest"],
      "horse": ["horse", "ride", "stable", "gallop"],
      "unicorn": ["unicorn", "magical", "fantasy", "rainbow"],
      "bee": ["bee", "honey", "buzz", "sting"],
      "bug": ["bug", "insect", "creepy", "crawly"],
      "butterfly": ["butterfly", "beautiful", "colorful", "flying"],
      "snail": ["snail", "slow", "shell", "slime"],
      "worm": ["worm", "slimy", "fishing", "dirt"],
      "beetle": ["beetle", "insect", "antenna", "shell"],
      "ant": ["ant", "colony", "tiny", "worker"],
      "crab": ["crab", "beach", "claws", "sideways"],
      "snake": ["snake", "hiss", "slither", "venom"],
      "lizard": ["lizard", "reptile", "scale", "cold"],
      "dragon": ["dragon", "mythical", "fire", "powerful"],
      "sauropod": ["dinosaur", "extinct", "prehistoric", "huge"],
      "t-rex": ["dinosaur", "tyrannosaurus", "rex", "extinct"],

      // Plants and nature
      "cactus": ["cactus", "desert", "spiky", "dry"],
      "flower": ["flower", "bloom", "garden", "beautiful"],
      "bouquet": ["flowers", "gift", "romantic", "beautiful"],
      "cherry blossom": ["sakura", "japanese", "spring", "beautiful"],
      "tulip": ["tulip", "flower", "netherlands", "spring"],
      "seedling": ["seedling", "new", "growing", "plant"],
      "evergreen tree": ["tree", "forest", "nature", "green"],
      "deciduous tree": ["tree", "forest", "nature", "autumn"],
      "palm tree": ["palm", "tropical", "beach", "vacation"],
      "cactus": ["cactus", "desert", "spiky", "arid"],
      "ear of corn": ["corn", "maize", "food", "yellow"],
      "herb": ["herb", "plant", "cooking", "seasoning"],

      // Food
      "grapes": ["grapes", "wine", "fruit", "purple"],
      "melon": ["melon", "fruit", "summer", "sweet"],
      "watermelon": ["watermelon", "summer", "fruit", "red"],
      "tangerine": ["tangerine", "orange", "citrus", "fruit"],
      "lemon": ["lemon", "sour", "citrus", "yellow"],
      "banana": ["banana", "fruit", "yellow", "monkey food"],
      "pineapple": ["pineapple", "tropical", "sweet", "spiky"],
      "mango": ["mango", "tropical", "sweet", "orange"],
      "apple": ["apple", "fruit", "red", "green", "teacher"],
      "pear": ["pear", "fruit", "green", "sweet"],
      "peach": ["peach", "fruit", "fuzzy", "pink"],
      "cherries": ["cherries", "fruit", "red", "sweet"],
      "strawberry": ["strawberry", "fruit", "red", "sweet"],
      "kiwi": ["kiwi", "fruit", "fuzzy", "brown"],
      "tomato": ["tomato", "vegetable", "red", "sauce"],
      "avocado": ["avocado", "fruit", "green", "toast"],
      "eggplant": ["eggplant", "vegetable", "purple", "aubergine"],
      "carrot": ["carrot", "vegetable", "orange", "rabbit food"],
      "corn": ["corn", "maize", "yellow", "popcorn"],
      "hot pepper": ["chili", "spicy", "hot", "pepper"],
      "bell pepper": ["pepper", "vegetable", "sweet", "colorful"],
      "broccoli": ["broccoli", "vegetable", "green", "healthy"],
      "cucumber": ["cucumber", "vegetable", "green", "salad"],
      "leafy green": ["salad", "lettuce", "vegetable", "healthy"],
      "mushroom": ["mushroom", "fungi", "forest", "magical"],
      "peanuts": ["peanuts", "nut", "butter", "allergy"],
      "chestnut": ["chestnut", "nut", "roasting", "winter"],
      "bread": ["bread", "baked", "wheat", "sandwich"],
      "croissant": ["croissant", "french", "breakfast", "buttery"],
      "baguette": ["baguette", "french", "bread", "long"],
      "pretzel": ["pretzel", "snack", "german", "knot"],
      "cheese": ["cheese", "dairy", "yellow", "mouse"],
      "egg": ["egg", "breakfast", "protein", "yolk"],
      "cooking": ["cooking", "food", "kitchen", "chef"],
      "bacon": ["bacon", "breakfast", "pork", "crispy"],
      "pancakes": ["pancakes", "breakfast", "syrup", "fluffy"],
      "waffle": ["waffle", "breakfast", "syrup", "grid"],
      "cheese wedge": ["cheese", "dairy", "swiss", "holes"],
      "meat on bone": ["meat", "bone", "dog", "chew"],
      "poultry leg": ["chicken", "drumstick", "meat", "fried"],
      "cut of meat": ["steak", "meat", "grill", "beef"],
      "bacon": ["bacon", "pork", "breakfast", "crispy"],
      "hamburger": ["burger", "fast food", "american", "patty"],
      "fries": ["fries", "fast food", "potato", "ketchup"],
      "pizza": ["pizza", "italian", "cheese", "pepperoni"],
      "hot dog": ["hot dog", "fast food", "sausage", "bun"],
      "sandwich": ["sandwich", "lunch", "bread", "filling"],
      "taco": ["taco", "mexican", "shell", "spicy"],
      "burrito": ["burrito", "mexican", "wrap", "rice"],
      "tamale": ["tamale", "mexican", "corn", "wrapped"],
      "stuffed flatbread": ["kebab", "middle eastern", "meat", "skewer"],
      "falafel": ["falafel", "middle eastern", "chickpea", "vegetarian"],
      "egg": ["egg", "breakfast", "protein", "yolk"],
      "shallow pan of food": ["paella", "spanish", "rice", "seafood"],
      "fondue": ["fondue", "cheese", "dipping", "swiss"],
      "bowl with spoon": ["soup", "bowl", "hot", "comfort food"],
      "canned food": ["can", "preserved", "food", "storage"],
      "bento box": ["bento", "japanese", "lunch", "box"],
      "pot of food": ["stew", "soup", "cooking", "warm"],
      "green salad": ["salad", "healthy", "vegetables", "fresh"],
      "popcorn": ["popcorn", "movie", "snack", "buttered"],
      "butter": ["butter", "dairy", "yellow", "spread"],
      "salt": ["salt", "seasoning", "white", "crystal"],
      "canned food": ["can", "preserved", "food", "storage"],

      // Drinks
      "baby bottle": ["baby", "milk", "feeding", "infant"],
      "teacup without handle": ["tea", "drink", "hot", "british"],
      "sake": ["sake", "japanese", "alcohol", "rice wine"],
      "bottle with popping cork": ["champagne", "celebration", "bubbles", "alcohol"],
      "wine glass": ["wine", "alcohol", "drink", "grapes"],
      "cocktail glass": ["cocktail", "alcohol", "drink", "martini"],
      "tropical drink": ["cocktail", "tropical", "umbrella", "vacation"],
      "beer mug": ["beer", "alcohol", "drink", "pub"],
      "clinking beer mugs": ["cheers", "celebration", "beer", "friends"],
      "clinking glasses": ["cheers", "celebration", "toast", "drink"],
      "tumbler glass": ["whiskey", "glass", "drink", "alcohol"],
      "cup with straw": ["smoothie", "juice", "straw", "cold drink"],
      "mate": ["mate", "tea", "south american", "gourd"],
      "ice": ["ice", "cold", "freezing", "cube"],
      "chocolate bar": ["chocolate", "candy", "sweet", "bar"],
      "candy": ["candy", "sweet", "sugar", "treat"],
      "lollipop": ["lollipop", "candy", "sweet", "stick"],
      "custard": ["custard", "dessert", "sweet", "pudding"],
      "lollipop": ["lollipop", "candy", "sweet", "stick"],
      "honey pot": ["honey", "sweet", "bee", "golden"],
      "baby bottle": ["baby", "milk", "feeding", "infant"],
      "milk glass": ["milk", "dairy", "drink", "white"],
      "cup with straw": ["straw", "juice", "smoothie", "cold drink"],
      "ice cream": ["ice cream", "cold", "sweet", "dessert"],
      "shaved ice": ["shaved ice", "dessert", "sweet", "cold"],
      "doughnut": ["doughnut", "donut", "sweet", "breakfast"],
      "cookie": ["cookie", "sweet", "chocolate chip", "baked"],
      "birthday cake": ["birthday", "cake", "celebration", "candles"],
      "shortcake": ["strawberry shortcake", "dessert", "sweet", "fruit"],
      "cupcake": ["cupcake", "dessert", "sweet", "frosting"],
      "pie": ["pie", "dessert", "sweet", "fruit"],
      "moon cake": ["moon cake", "chinese", "festival", "autumn"],

      // Sports and activities
      "basketball": ["basketball", "sport", "hoop", "dribble"],
      "football": ["football", "sport", "american", "touchdown"],
      "rugby football": ["rugby", "sport", "tackle", "team"],
      "tennis": ["tennis", "sport", "racket", "ball"],
      "volleyball": ["volleyball", "sport", "net", "beach"],
      "table tennis": ["ping pong", "table tennis", "paddle", "ball"],
      "badminton": ["badminton", "sport", "racket", "shuttlecock"],
      "goal": ["goal", "soccer", "scoring", "net"],
      "hockey": ["hockey", "sport", "ice", "puck"],
      "field hockey": ["field hockey", "sport", "grass", "stick"],
      "cricket": ["cricket", "sport", "bat", "wicket"],
      "golf": ["golf", "sport", "hole", "club"],
      "bow and arrow": ["archery", "bow", "arrow", "target"],
      "fishing pole": ["fishing", "fish", "rod", "catch"],
      "running shirt": ["running", "sport", "marathon", "jersey"],
      "ski": ["skiing", "snow", "winter", "mountain"],
      "skier": ["skiing", "snow", "winter", "mountain"],
      "snowboarder": ["snowboarding", "snow", "winter", "board"],
      "person lifting weights": ["gym", "workout", "strength", "muscle"],
      "person fencing": ["fencing", "sword", "sport", "duel"],
      "people wrestling": ["wrestling", "sport", "fight", "match"],
      "person playing handball": ["handball", "sport", "ball", "team"],
      "person juggling": ["juggling", "circus", "skill", "balls"],
      "person in lotus position": ["yoga", "meditation", "zen", "peaceful"],
      "person taking bath": ["bath", "shower", "clean", "relaxing"],
      "person in bed": ["sleep", "bed", "tired", "night"],
      "people holding hands": ["friends", "couple", "holding hands", "love"],
      "person walking": ["walking", "hiking", "exercise", "move"],
      "person standing": ["standing", "waiting", "idle", "still"],
      "person kneeling": ["kneeling", "praying", "respect", "proposal"],
      "person with propeller beanie": ["nerd", "dork", "geek", "funny"],
      "people with bunny ears": ["party", "fun", "bunny", "playful"],
      "person in tuxedo": ["formal", "wedding", "suit", "elegant"],
      "person with veil": ["bride", "wedding", "marriage", "veil"],
      "pregnant woman": ["pregnant", "baby", "mother", "family"],
      "person feeding baby": ["parent", "baby", "feeding", "family"],
      "boy": ["boy", "male", "kid", "child"],
      "girl": ["girl", "female", "kid", "child"],
      "person": ["person", "human", "individual", "someone"],
      "blond-haired person": ["blonde", "yellow hair", "person"],
      "older person": ["elderly", "senior", "old", "grandparent"],
      "man": ["man", "male", "guy", "person"],
      "woman": ["woman", "female", "lady", "person"],
      "health worker": ["doctor", "nurse", "medical", "healthcare"],
      "student": ["student", "school", "learning", "education"],
      "teacher": ["teacher", "school", "education", "classroom"],
      "judge": ["judge", "law", "court", "justice"],
      "farmer": ["farmer", "agriculture", "crops", "rural"],
      "cook": ["chef", "cooking", "kitchen", "food"],
      "mechanic": ["mechanic", "car", "repair", "tools"],
      "factory worker": ["worker", "factory", "labor", "industry"],
      "office worker": ["office", "work", "business", "corporate"],
      "scientist": ["scientist", "lab", "research", "discovery"],
      "technologist": ["tech", "computer", "programmer", "software"],
      "singer": ["singer", "music", "voice", "performing"],
      "artist": ["artist", "painting", "creative", "art"],
      "pilot": ["pilot", "plane", "flying", "aviation"],
      "astronaut": ["astronaut", "space", "rocket", "moon"],
      "firefighter": ["firefighter", "fire", "rescue", "hero"],
      "police officer": ["police", "cop", "law", "officer"],
      "detective": ["detective", "investigator", "mystery", "crime"],
      "guard": ["security", "guard", "protection", "safety"],
      "construction worker": ["construction", "building", "worker", "hard hat"],
      "prince": ["prince", "royal", "crown", "kingdom"],
      "princess": ["princess", "royal", "crown", "queen"],
      "person wearing turban": ["turban", "sikh", "religious", "headwear"],
      "person with skullcap": ["yarmulke", "jewish", "religious", "hat"],
      "woman with headscarf": ["hijab", "muslim", "religious", "modest"],
      "person in tuxedo": ["tuxedo", "formal", "suit", "wedding"],
      "person with veil": ["veil", "wedding", "bride", "marriage"],
      "pregnant woman": ["pregnant", "expecting", "baby", "mother"],

      // Objects and symbols
      "glasses": ["glasses", "vision", "eyes", "nerd"],
      "sunglasses": ["sunglasses", "shades", "cool", "sun"],
      "necktie": ["tie", "formal", "work", "business"],
      "t-shirt": ["tshirt", "casual", "shirt", "clothes"],
      "jeans": ["jeans", "pants", "denim", "casual"],
      "dress": ["dress", "formal", "woman", "elegant"],
      "bikini": ["bikini", "swimsuit", "beach", "summer"],
      "woman's clothes": ["clothes", "shopping", "fashion", "woman"],
      "purse": ["purse", "handbag", "bag", "woman"],
      "handbag": ["handbag", "purse", "bag", "fashion"],
      "clutch bag": ["clutch", "purse", "evening", "formal"],
      "shopping bags": ["shopping", "bags", "retail", "store"],
      "backpack": ["backpack", "school", "hiking", "travel"],
      "thong sandal": ["flip flops", "sandals", "beach", "summer"],
      "man's shoe": ["shoe", "footwear", "walking", "formal"],
      "running shoe": ["sneakers", "running", "sports", "shoes"],
      "hiking boot": ["boots", "hiking", "outdoor", "mountain"],
      "flat shoe": ["flats", "shoes", "comfortable", "woman"],
      "high-heel shoe": ["heels", "high heels", "fancy", "woman"],
      "woman's sandal": ["sandals", "summer", "open toe", "woman"],
      "ballet shoes": ["ballet", "dance", "slippers", "graceful"],
      "woman's boot": ["boots", "winter", "fashion", "woman"],
      "crown": ["crown", "king", "queen", "royal"],
      "woman's hat": ["hat", "fashion", "woman", "style"],
      "top hat": ["top hat", "formal", "magician", "elegant"],
      "graduation cap": ["graduation", "cap", "education", "diploma"],
      "billed cap": ["baseball cap", "cap", "sports", "casual"],
      "military helmet": ["helmet", "military", "army", "protection"],
      "rescue worker's helmet": ["helmet", "construction", "safety", "worker"],
      "with veil": ["veil", "wedding", "bride", "marriage"],
      "wilted flower": ["wilted", "dying", "sad", "flower"],
      "potted plant": ["plant", "pot", "nature", "green"],
      "herb": ["herb", "plant", "cooking", "seasoning"],
      "shamrock": ["shamrock", "clover", "irish", "luck"],
      "four leaf clover": ["clover", "luck", "irish", "four leaf"],
      "pine decoration": ["pine", "christmas", "decoration", "winter"],
      "christmas tree": ["christmas", "tree", "decorations", "holiday"],
      "spiral shell": ["shell", "seashell", "beach", "ocean"],
      "shell": ["seashell", "beach", "ocean", "sand"],
      "teddy bear": ["teddy bear", "stuffed animal", "toy", "cute"],
      "chair": ["chair", "furniture", "sitting", "room"],
      "couch and lamp": ["couch", "sofa", "furniture", "living room"],
      "bed": ["bed", "sleep", "furniture", "bedroom"],
      "toilet": ["toilet", "bathroom", "restroom", "wc"],
      "shower": ["shower", "bathroom", "cleaning", "water"],
      "bathtub": ["bathtub", "bath", "relaxing", "bubbles"],
      "hourglass": ["hourglass", "time", "sand", "waiting"],
      "watch": ["watch", "time", "clock", "wrist"],
      "alarm clock": ["alarm", "clock", "morning", "wake up"],
      "stopwatch": ["stopwatch", "timer", "sports", "racing"],
      "timer clock": ["timer", "countdown", "clock", "cooking"],
      "mantelpiece clock": ["clock", "fireplace", "classic", "time"],
      "frame with picture": ["picture", "frame", "photo", "memory"],
      "compass": ["compass", "direction", "navigation", "north"],
      "optical disk": ["cd", "dvd", "disk", "media"],
      "dvd": ["dvd", "movie", "disk", "entertainment"],
      "floppy disk": ["floppy", "disk", "old", "computer"],
      "battery": ["battery", "power", "energy", "charge"],
      "electric plug": ["plug", "electricity", "power", "outlet"],
      "bulb": ["lightbulb", "idea", "light", "bright"],
      "flashlight": ["flashlight", "torch", "light", "dark"],
      "candle": ["candle", "light", "romantic", "fire"],
      "fire": ["fire", "flame", "hot", "danger"],
      "firecracker": ["firecracker", "explosion", "celebration", "loud"],
      "dynamite": ["dynamite", "explosion", "danger", "stick"],
      "oil drum": ["oil", "drum", "barrel", "industrial"],
      "bomb": ["bomb", "explosion", "danger", "destroy"],
      "knife": ["knife", "weapon", "cutting", "danger"],
      "dagger": ["dagger", "knife", "weapon", "sharp"],
      "crossed swords": ["swords", "weapon", "battle", "fight"],
      "gun": ["gun", "weapon", "firearm", "danger"],
      "boomerang": ["boomerang", "australian", "weapon", "throwing"],
      "bow and arrow": ["bow", "arrow", "weapon", "archery"],
      "shield": ["shield", "protection", "defense", "armor"],
      "wrench": ["wrench", "tool", "repair", "mechanic"],
      "hammer": ["hammer", "tool", "build", "nail"],
      "nut and bolt": ["nut", "bolt", "tool", "hardware"],
      "gear": ["gear", "mechanical", "machine", "work"],
      "clamp": ["clamp", "tool", "hold", "fix"],
      "balance scale": ["scale", "justice", "balance", "law"],
      "probing cane": ["cane", "blind", "walking", "stick"],
      "link": ["link", "chain", "connection", "url"],
      "chains": ["chains", "lock", "bond", "connection"],
      "hook": ["hook", "hang", "fishing", "tool"],
      "toolbox": ["toolbox", "tools", "repair", "work"],
      "magnet": ["magnet", "attract", "metal", "power"],
      "ladder": ["ladder", "climb", "reach", "high"],
      "alembic": ["alembic", "chemistry", "science", "experiment"],
      "test tube": ["test tube", "science", "lab", "experiment"],
      "petri dish": ["petri dish", "science", "bacteria", "lab"],
      "dna": ["dna", "genetics", "science", "helix"],
      "microscope": ["microscope", "science", "zoom", "research"],
      "telescope": ["telescope", "astronomy", "stars", "space"],
      "satellite antenna": ["satellite", "space", "signal", "communication"],
      "syringe": ["syringe", "needle", "medical", "injection"],
      "drop of blood": ["blood", "drop", "medical", "red"],
      "pill": ["pill", "medicine", "drug", "health"],
      "adhesive bandage": ["bandage", "first aid", "heal", "wound"],
      "crutch": ["crutch", "injury", "support", "medical"],
      "stethoscope": ["stethoscope", "doctor", "medical", "health"],
      "door": ["door", "entrance", "exit", "access"],
      "bed": ["bed", "sleep", "rest", "furniture"],
      "toilet": ["toilet", "bathroom", "restroom", "wc"],
      "shower": ["shower", "bathroom", "clean", "water"],
      "bathtub": ["bathtub", "bath", "relax", "water"],
      "key": ["key", "lock", "unlock", "access"],
      "old key": ["key", "lock", "antique", "old"],
      "house": ["house", "home", "building", "living"],
      "house with garden": ["house", "garden", "home", "nature"],
      "office building": ["office", "work", "business", "skyscraper"],
      "japanese post office": ["post office", "japan", "mail", "postal"],
      "hospital": ["hospital", "medical", "health", "emergency"],
      "bank": ["bank", "money", "finance", "atm"],
      "hotel": ["hotel", "vacation", "travel", "stay"],
      "convenience store": ["store", "shop", "convenience", "24/7"],
      "school": ["school", "education", "learning", "students"],
      "department store": ["store", "shopping", "mall", "retail"],
      "factory": ["factory", "industry", "manufacturing", "work"],
      "japanese castle": ["castle", "japan", "historic", "fortress"],
      "castle": ["castle", "historic", "fortress", "medieval"],
      "wedding": ["wedding", "marriage", "couple", "celebration"],
      "tokyo tower": ["tokyo", "tower", "japan", "landmark"],
      "statue of liberty": ["statue of liberty", "new york", "freedom", "america"],
      "european castle": ["castle", "europe", "historic", "fortress"],
      "wind chime": ["wind chime", "sound", "breeze", "relaxing"],
      "bell": ["bell", "ring", "sound", "notification"],
      "scales": ["scales", "justice", "balance", "law"],
      "shopping cart": ["cart", "shopping", "store", "buy"],
      "wheel": ["wheel", "car", "transport", "motion"],
      "ring": ["ring", "jewelry", "marriage", "circle"],
      "gem stone": ["gem", "jewel", "diamond", "precious"],
      "money bag": ["money", "cash", "wealth", "rich"],
      "coin": ["coin", "money", "change", "currency"],
      "credit card": ["credit card", "money", "pay", "plastic"],
      "yen banknote": ["yen", "money", "japan", "currency"],
      "dollar bill": ["dollar", "money", "usa", "currency"],
      "pound banknote": ["pound", "money", "uk", "currency"],
      "euro banknote": ["euro", "money", "europe", "currency"],
      "money with wings": ["money", "rich", "flying", "wealth"],
      "chart increasing": ["growth", "success", "profit", "up"],
      "chart decreasing": ["loss", "failure", "down", "decrease"],
      "seat": ["seat", "chair", "sit", "place"],
      "stop sign": ["stop", "sign", "red", "octagon"],
      "construction": ["construction", "work", "building", "warning"],
      "triangular flag": ["flag", "marker", "point", "location"],

      // Weather and nature
      "sun": ["sun", "sunny", "bright", "day", "light"],
      "crescent moon": ["moon", "night", "sleepy", "crescent"],
      "new moon": ["moon", "night", "dark", "new"],
      "waxing crescent moon": ["moon", "night", "growing", "crescent"],
      "first quarter moon": ["moon", "night", "half", "quarter"],
      "waxing gibbous moon": ["moon", "night", "growing", "gibbous"],
      "full moon": ["moon", "night", "full", "bright"],
      "waning gibbous moon": ["moon", "night", "shrinking", "gibbous"],
      "last quarter moon": ["moon", "night", "half", "quarter"],
      "waning crescent moon": ["moon", "night", "shrinking", "crescent"],
      "star": ["star", "night", "sparkle", "celestial"],
      "glowing star": ["star", "glowing", "bright", "shining"],
      "shooting star": ["shooting star", "meteor", "wish", "night"],
      "milky way": ["milky way", "galaxy", "space", "stars"],
      "cloud": ["cloud", "sky", "weather", "white"],
      "sun behind cloud": ["cloudy", "partly sunny", "weather", "gray"],
      "cloud with lightning and rain": ["storm", "thunder", "rain", "lightning"],
      "sun behind rain cloud": ["sun shower", "rain", "sun", "weather"],
      "rainbow": ["rainbow", "colorful", "pride", "gay"],
      "cloud with rain": ["rain", "cloudy", "weather", "wet"],
      "cloud with snow": ["snow", "winter", "cold", "cloudy"],
      "face with rain": ["rain", "sad", "weather", "wet"],
      "tornado": ["tornado", "twister", "storm", "wind"],
      "fog": ["fog", "misty", "cloudy", "visibility"],
      "wind face": ["wind", "breeze", "air", "weather"],
      "cyclone": ["cyclone", "hurricane", "storm", "swirl"],
      "fire": ["fire", "hot", "flame", "burning"],
      "droplet": ["water", "drop", "liquid", "wet"],
      "ocean wave": ["ocean", "wave", "sea", "water"],
      "volcano": ["volcano", "eruption", "lava", "mountain"],
      "milky way": ["galaxy", "stars", "space", "night"],
      "earth globe": ["earth", "globe", "world", "planet"],
      "full moon": ["moon", "night", "full", "bright"],
      "new moon face": ["moon", "night", "dark", "sleepy"],
      "sun with face": ["sun", "sunny", "happy", "bright"],
      "glowing star": ["star", "shining", "bright", "sparkle"],
      "shooting star": ["meteor", "shooting", "wish", "night"],
      "rainbow": ["rainbow", "colorful", "pride", "gay"],
      "cloud": ["cloud", "weather", "sky", "gray"],
      "sun behind cloud": ["partly sunny", "cloudy", "weather"],
      "cloud with rain": ["rain", "storm", "weather", "wet"],
      "cloud with snow": ["snow", "winter", "cold", "weather"],
      "lightning": ["lightning", "storm", "thunder", "electric"],
      "tornado": ["tornado", "twister", "storm", "wind"],
      "fog": ["fog", "misty", "cloudy", "weather"],
      "wind": ["wind", "breeze", "air", "movement"],
      "water wave": ["ocean", "wave", "sea", "water"],
      "volcano": ["volcano", "lava", "eruption", "fire"],
      "earth": ["earth", "planet", "world", "globe"],
      "full moon": ["moon", "night", "full", "bright"],
      "new moon": ["moon", "night", "dark", "beginning"],
      "first quarter moon": ["moon", "night", "half", "quarter"],
      "last quarter moon": ["moon", "night", "half", "quarter"],
      "waning crescent moon": ["moon", "night", "crescent", "shrinking"],
      "waning gibbous moon": ["moon", "night", "gibbous", "shrinking"],
      "waxing crescent moon": ["moon", "night", "crescent", "growing"],
      "waxing gibbous moon": ["moon", "night", "gibbous", "growing"],
      "crescent moon": ["moon", "night", "crescent", "islamic"],
      "new moon face": ["moon", "night", "face", "dark"],
      "first quarter moon face": ["moon", "night", "face", "half"],
      "last quarter moon face": ["moon", "night", "face", "half"],
      "thermometer": ["thermometer", "temperature", "hot", "cold"],
      "sunny": ["sunny", "bright", "warm", "clear"],
      "partly sunny": ["partly sunny", "cloudy", "mixed", "weather"],
      "rainy": ["rainy", "wet", "umbrella", "weather"],
      "snowy": ["snowy", "cold", "winter", "white"],
      "stormy": ["stormy", "thunder", "lightning", "wind"],
      "foggy": ["foggy", "misty", "cloudy", "visibility"],
      "windy": ["windy", "breezy", "air", "movement"],
      "hot": ["hot", "warm", "temperature", "sun"],
      "cold": ["cold", "chilly", "temperature", "winter"],
      "freezing": ["freezing", "cold", "ice", "winter"],
      "mild": ["mild", "pleasant", "temperature", "weather"],
      "cool": ["cool", "chilly", "comfortable", "weather"],
      "warm": ["warm", "comfortable", "temperature", "sunny"],

      // Flags
      "checkered flag": ["checkered flag", "finish line", "racing", "victory"],
      "triangular flag": ["flag", "marker", "point", "location"],
      "crossed flags": ["flags", "crossed", "international", "celebration"],
      "black flag": ["black flag", "pirate", "warning", "anarchy"],
      "white flag": ["white flag", "surrender", "peace", "truce"],
      "rainbow flag": ["rainbow flag", "pride", "lgbt", "gay"],
      "transgender flag": ["transgender flag", "trans", "pride", "flag"],
      "pirate flag": ["pirate flag", "jolly roger", "skull", "crossbones"],

      // Symbols
      "heart": ["heart", "love", "affection", "like"],
      "broken heart": ["broken heart", "sad", "breakup", "hurt"],
      "two hearts": ["two hearts", "love", "couple", "romance"],
      "sparkling heart": ["sparkling heart", "love", "magical", "special"],
      "growing heart": ["growing heart", "love", "expanding", "affection"],
      "beating heart": ["beating heart", "love", "heartbeat", "alive"],
      "revolving hearts": ["revolving hearts", "love", "romance", "dating"],
      "heart with arrow": ["heart with arrow", "cupid", "love", "romance"],
      "blue heart": ["blue heart", "trust", "loyalty", "calm"],
      "green heart": ["green heart", "nature", "envy", "growth"],
      "yellow heart": ["yellow heart", "friendship", "happiness", "joy"],
      "purple heart": ["purple heart", "honor", "bravery", "military"],
      "brown heart": ["brown heart", "earth", "nature", "grounded"],
      "black heart": ["black heart", "dark", "edgy", "alternative"],
      "white heart": ["white heart", "purity", "clean", "innocent"],
      "hundred points": ["100", "perfect", "hundred", "score"],
      "anger symbol": ["angry", "mad", "furious", "rage"],
      "collision": ["boom", "bang", "crash", "explosion"],
      "dizzy": ["dizzy", "confused", "spinning", "stars"],
      "sweat droplets": ["sweat", "effort", "hard work", "drops"],
      "dashing away": ["running", "fast", "dash", "speed"],
      "hole": ["hole", "empty", "nothing", "void"],
      "hot beverage": ["coffee", "tea", "hot", "drink"],
      "pot": ["pot", "cooking", "food", "heat"],
      "waving hand": ["wave", "hello", "goodbye", "hi"],
      "raised hand": ["hand", "raised", "volunteer", "stop"],
      "middle finger": ["middle finger", "fuck you", "rude", "insult"],
      "raised back of hand": ["back of hand", "stop", "halt", "no"],
      "raised hand with fingers splayed": ["hand", "fingers", "five", "stop"],
      "vulcan salute": ["vulcan", "star trek", "live long", "spock"],
      "ok hand": ["ok", "perfect", "good", "okay"],
      "pinched fingers": ["pinch", "small amount", "italian", "gesture"],
      "pinching hand": ["pinch", "small", "gesture", "italian"],
      "victory hand": ["victory", "peace", "v sign", "win"],
      "crossed fingers": ["fingers crossed", "luck", "hope", "wish"],
      "love-you gesture": ["love you", "hand heart", "affection", "sign"],
      "sign of the horns": ["rock", "devil horns", "metal", "concert"],
      "call me hand": ["call me", "phone", "gesture", "hello"],
      "backhand index pointing left": ["pointing", "left", "direction", "over there"],
      "backhand index pointing right": ["pointing", "right", "direction", "over there"],
      "backhand index pointing up": ["pointing", "up", "direction", "above"],
      "middle finger": ["middle finger", "fuck you", "insult", "rude"],
      "backhand index pointing down": ["pointing", "down", "direction", "below"],
      "index pointing up": ["pointing", "up", "important", "attention"],
      "thumbs up": ["thumbs up", "good", "ok", "approve"],
      "thumbs down": ["thumbs down", "bad", "no", "dislike"],
      "raised fist": ["fist", "power", "strength", "solidarity"],
      "oncoming fist": ["fist bump", "bro fist", "greeting", "respect"],
      "left-facing fist": ["fist", "left", "direction", "power"],
      "right-facing fist": ["fist", "right", "direction", "power"],
      "raised clapping hands": ["clapping", "applause", "bravo", "praise"],
      "open hands": ["open hands", "hug", "embrace", "give"],
      "palms up together": ["palms up", "prayer", "please", "begging"],
      "handshake": ["handshake", "agreement", "deal", "partnership"],
      "writing hand": ["writing", "pen", "signature", "document"],
      "nail polish": ["nail polish", "beauty", "manicure", "color"],
      "selfie": ["selfie", "photo", "picture", "camera"],
      "flexed biceps": ["muscle", "strong", "fitness", "gym"],
      "mechanical arm": ["robot", "mechanical", "technology", "arm"],
      "leg": ["leg", "foot", "walking", "kick"],
      "foot": ["foot", "kick", "walk", "step"],
      "ear": ["ear", "listen", "hearing", "sound"],
      "ear with hearing aid": ["hearing aid", "deaf", "assist", "device"],
      "nose": ["nose", "smell", "scent", "breathing"],
      "brain": ["brain", "mind", "thinking", "intelligence"],
      "anatomical heart": ["anatomical heart", "medical", "organ", "health"],
      "lungs": ["lungs", "breathing", "medical", "health"],
      "tooth": ["tooth", "dental", "smile", "health"],
      "bone": ["bone", "skeleton", "medical", "health"],
      "eye": ["eye", "see", "vision", "look"],
      "tongue": ["tongue", "taste", "lick", "mouth"],
      "mouth": ["mouth", "speak", "eat", "kiss"],
      "busts in silhouette": ["people", "silhouette", "crowd", "group"],
      "bust in silhouette": ["person", "silhouette", "shadow", "outline"],
      "speaking head": ["talking", "speaking", "voice", "conversation"],
      "globe showing americas": ["americas", "globe", "world", "earth"],
      "globe showing europe-africa": ["europe", "africa", "globe", "world"],
      "globe showing asia-australia": ["asia", "australia", "globe", "world"],
      "globe with meridians": ["globe", "world", "earth", "planet"],
      "world map": ["world", "map", "earth", "globe"],
      "japan": ["japan", "japanese", "tokyo", "asia"],
      "korea": ["korea", "korean", "seoul", "asia"],
      "china": ["china", "chinese", "beijing", "asia"],
      "vietnam": ["vietnam", "vietnamese", "asia", "hanoi"],
      "france": ["france", "french", "paris", "europe"],
      "germany": ["germany", "german", "berlin", "europe"],
      "italy": ["italy", "italian", "rome", "europe"],
      "spain": ["spain", "spanish", "madrid", "europe"],
      "portugal": ["portugal", "portuguese", "lisbon", "europe"],
      "russia": ["russia", "russian", "moscow", "europe"],
      "united kingdom": ["uk", "britain", "london", "england"],
      "england": ["england", "british", "london", "uk"],
      "scotland": ["scotland", "scottish", "edinburgh", "uk"],
      "wales": ["wales", "welsh", "cardiff", "uk"],
      "ireland": ["ireland", "irish", "dublin", "europe"],
      "netherlands": ["netherlands", "dutch", "amsterdam", "holland"],
      "belgium": ["belgium", "belgian", "brussels", "europe"],
      "luxembourg": ["luxembourg", "luxembourgish", "europe"],
      "austria": ["austria", "austrian", "vienna", "europe"],
      "switzerland": ["switzerland", "swiss", "bern", "europe"],
      "poland": ["poland", "polish", "warsaw", "europe"],
      "czech republic": ["czech", "prague", "europe", "central"],
      "slovakia": ["slovakia", "slovak", "bratislava", "europe"],
      "hungary": ["hungary", "hungarian", "budapest", "europe"],
      "romania": ["romania", "romanian", "bucharest", "europe"],
      "moldova": ["moldova", "moldovan", "chisinau", "europe"],
      "belarus": ["belarus", "belarusian", "minsk", "europe"],
      "ukraine": ["ukraine", "ukrainian", "kiev", "europe"],
      "bulgaria": ["bulgaria", "bulgarian", "sofia", "europe"],
      "greece": ["greece", "greek", "athens", "europe"],
      "albania": ["albania", "albanian", "tirana", "europe"],
      "macedonia": ["macedonia", "macedonian", "skopje", "europe"],
      "serbia": ["serbia", "serbian", "belgrade", "europe"],
      "montenegro": ["montenegro", "montenegrin", "podgorica", "europe"],
      "kosovo": ["kosovo", "kosovar", "pristina", "europe"],
      "croatia": ["croatia", "croatian", "zagreb", "europe"],
      "slovenia": ["slovenia", "slovenian", "ljubljana", "europe"],
      "bosnia": ["bosnia", "bosnian", "sarajevo", "europe"],
      "denmark": ["denmark", "danish", "copenhagen", "europe"],
      "finland": ["finland", "finnish", "helsinki", "europe"],
      "sweden": ["sweden", "swedish", "stockholm", "europe"],
      "norway": ["norway", "norwegian", "oslo", "europe"],
      "iceland": ["iceland", "icelandic", "reykjavik", "europe"],
      "estonia": ["estonia", "estonian", "tallinn", "europe"],
      "latvia": ["latvia", "latvian", "riga", "europe"],
      "lithuania": ["lithuania", "lithuanian", "vilnius", "europe"],
      "malta": ["malta", "maltese", "valletta", "europe"],
      "cyprus": ["cyprus", "cypriot", "nicosia", "europe"],
      "turkey": ["turkey", "turkish", "ankara", "europe"],
      "azerbaijan": ["azerbaijan", "azerbaijani", "baku", "europe"],
      "georgia": ["georgia", "georgian", "tbilisi", "europe"],
      "armenia": ["armenia", "armenian", "yerevan", "europe"],
      "turkmenistan": ["turkmenistan", "turkmen", "ashgabat", "asia"],
      "kazakhstan": ["kazakhstan", "kazakh", "nur-sultan", "asia"],
      "uzbekistan": ["uzbekistan", "uzbek", "tashkent", "asia"],
      "kyrgyzstan": ["kyrgyzstan", "kyrgyz", "bishkek", "asia"],
      "tajikistan": ["tajikistan", "tajik", "dushanbe", "asia"],
      "afghanistan": ["afghanistan", "afghan", "kabul", "asia"],
      "pakistan": ["pakistan", "pakistani", "islamabad", "asia"],
      "india": ["india", "indian", "new delhi", "asia"],
      "bangladesh": ["bangladesh", "bangladeshi", "dhaka", "asia"],
      "sri lanka": ["sri lanka", "sri lankan", "colombo", "asia"],
      "nepal": ["nepal", "nepalese", "kathmandu", "asia"],
      "bhutan": ["bhutan", "bhutanese", "thimphu", "asia"],
      "maldives": ["maldives", "maldivian", "male", "asia"],
      "myanmar": ["myanmar", "burmese", "naypyidaw", "asia"],
      "thailand": ["thailand", "thai", "bangkok", "asia"],
      "laos": ["laos", "lao", "vientiane", "asia"],
      "cambodia": ["cambodia", "cambodian", "phnom penh", "asia"],
      "vietnam": ["vietnam", "vietnamese", "hanoi", "asia"],
      "philippines": ["philippines", "filipino", "manila", "asia"],
      "indonesia": ["indonesia", "indonesian", "jakarta", "asia"],
      "malaysia": ["malaysia", "malaysian", "kuala lumpur", "asia"],
      "singapore": ["singapore", "singaporean", "asia"],
      "brunei": ["brunei", "bruneian", "bandar seri begawan", "asia"],
      "east timor": ["east timor", "timorese", "dili", "asia"],
      "australia": ["australia", "australian", "canberra", "oceania"],
      "new zealand": ["new zealand", "new zealander", "wellington", "oceania"],
      "fiji": ["fiji", "fijian", "suva", "oceania"],
      "papua new guinea": ["papua new guinea", "papuan", "port moresby", "oceania"],
      "solomon islands": ["solomon islands", "solomon", "honiara", "oceania"],
      "vanuatu": ["vanuatu", "vanuatuan", "port vila", "oceania"],
      "samoa": ["samoa", "samoan", "apia", "oceania"],
      "tonga": ["tonga", "tongan", "nuku'alofa", "oceania"],
      "tuvalu": ["tuvalu", "tuvaluan", "funafuti", "oceania"],
      "kiribati": ["kiribati", "kiribati", "tarawa", "oceania"],
      "marshall islands": ["marshall islands", "marshallese", "majuro", "oceania"],
      "micronesia": ["micronesia", "micronesian", "palikir", "oceania"],
      "nauru": ["nauru", "nauruan", "yaren", "oceania"],
      "palau": ["palau", "palauan", "melekeok", "oceania"],
      "canada": ["canada", "canadian", "ottawa", "america"],
      "united states": ["usa", "america", "american", "washington"],
      "mexico": ["mexico", "mexican", "mexico city", "america"],
      "guatemala": ["guatemala", "guatemalan", "guatemala city", "america"],
      "belize": ["belize", "belizean", "belmopan", "america"],
      "el salvador": ["el salvador", "salvadoran", "san salvador", "america"],
      "honduras": ["honduras", "honduran", "tegucigalpa", "america"],
      "nicaragua": ["nicaragua", "nicaraguan", "managua", "america"],
      "costa rica": ["costa rica", "costa rican", "san jose", "america"],
      "panama": ["panama", "panamanian", "panama city", "america"],
      "cuba": ["cuba", "cuban", "havana", "america"],
      "jamaica": ["jamaica", "jamaican", "kingston", "america"],
      "haiti": ["haiti", "haitian", "port-au-prince", "america"],
      "dominican republic": ["dominican republic", "dominican", "santo domingo", "america"],
      "puerto rico": ["puerto rico", "puerto rican", "san juan", "america"],
      "trinidad tobago": ["trinidad", "trinidadian", "port of spain", "america"],
      "barbados": ["barbados", "barbadian", "bridgetown", "america"],
      "dominica": ["dominica", "dominican", "roseau", "america"],
      "saint lucia": ["saint lucia", "lucian", "castries", "america"],
      "saint vincent grenadines": ["saint vincent", "vincentian", "kingstown", "america"],
      "grenada": ["grenada", "grenadian", "st. george's", "america"],
      "antigua barbuda": ["antigua", "antiguan", "st. john's", "america"],
      "saint kitts nevis": ["saint kitts", "kittitian", "basseterre", "america"],
      "bahamas": ["bahamas", "bahamian", "nassau", "america"],
      "brazil": ["brazil", "brazilian", "brasilia", "america"],
      "colombia": ["colombia", "colombian", "bogota", "america"],
      "venezuela": ["venezuela", "venezuelan", "caracas", "america"],
      "guyana": ["guyana", "guyanese", "georgetown", "america"],
      "suriname": ["suriname", "surinamese", "paramaribo", "america"],
      "ecuador": ["ecuador", "ecuadorian", "quito", "america"],
      "peru": ["peru", "peruvian", "lima", "america"],
      "bolivia": ["bolivia", "bolivian", "la paz", "america"],
      "paraguay": ["paraguay", "paraguayan", "asuncion", "america"],
      "uruguay": ["uruguay", "uruguayan", "montevideo", "america"],
      "chile": ["chile", "chilean", "santiago", "america"],
      "argentina": ["argentina", "argentine", "buenos aires", "america"],
      "egypt": ["egypt", "egyptian", "cairo", "africa"],
      "libya": ["libya", "libyan", "tripoli", "africa"],
      "tunisia": ["tunisia", "tunisian", "tunis", "africa"],
      "algeria": ["algeria", "algerian", "algiers", "africa"],
      "morocco": ["morocco", "moroccan", "rabat", "africa"],
      "sudan": ["sudan", "sudanese", "khartoum", "africa"],
      "south sudan": ["south sudan", "south sudanese", "juba", "africa"],
      "ethiopia": ["ethiopia", "ethiopian", "addis ababa", "africa"],
      "eritrea": ["eritrea", "eritrean", "asmara", "africa"],
      "djibouti": ["djibouti", "djiboutian", "djibouti", "africa"],
      "somalia": ["somalia", "somali", "mogadishu", "africa"],
      "kenya": ["kenya", "kenyan", "nairobi", "africa"],
      "uganda": ["uganda", "ugandan", "kampala", "africa"],
      "rwanda": ["rwanda", "rwandan", "kigali", "africa"],
      "burundi": ["burundi", "burundian", "bujumbura", "africa"],
      "tanzania": ["tanzania", "tanzanian", "dodoma", "africa"],
      "zambia": ["zambia", "zambian", "lusaka", "africa"],
      "malawi": ["malawi", "malawian", "lilongwe", "africa"],
      "mozambique": ["mozambique", "mozambican", "maputo", "africa"],
      "zimbabwe": ["zimbabwe", "zimbabwean", "harare", "africa"],
      "botswana": ["botswana", "botswanan", "gaborone", "africa"],
      "namibia": ["namibia", "namibian", "windhoek", "africa"],
      "south africa": ["south africa", "south african", "pretoria", "africa"],
      "lesotho": ["lesotho", "lesotho", "maseru", "africa"],
      "eswatini": ["eswatini", "swazi", "mbabane", "africa"],
      "madagascar": ["madagascar", "malagasy", "antananarivo", "africa"],
      "comoros": ["comoros", "comorian", "moroni", "africa"],
      "seychelles": ["seychelles", "seychellois", "victoria", "africa"],
      "mauritius": ["mauritius", "mauritian", "port louis", "africa"],
      "angola": ["angola", "angolan", "luanda", "africa"],
      "cameroon": ["cameroon", "cameroonian", "yaounde", "africa"],
      "central african republic": ["central african republic", "car", "bangui", "africa"],
      "chad": ["chad", "chadian", "ndjamena", "africa"],
      "equatorial guinea": ["equatorial guinea", "equatoguinean", "malabo", "africa"],
      "gabon": ["gabon", "gabonese", "libreville", "africa"],
      "republic of the congo": ["congo", "congolese", "brazzaville", "africa"],
      "democratic republic of the congo": ["drc", "congolese", "kinshasa", "africa"],
      "sao tome principe": ["sao tome", "sao tomean", "sao tome", "africa"],
      "cabo verde": ["cape verde", "cape verdean", "praia", "africa"],
      "guinea-bissau": ["guinea-bissau", "guinean", "bissau", "africa"],
      "guinea": ["guinea", "guinean", "conakry", "africa"],
      "sierra leone": ["sierra leone", "sierra leonean", "freetown", "africa"],
      "liberia": ["liberia", "liberian", "monrovia", "africa"],
      "ivory coast": ["ivory coast", "ivorian", "yamoussoukro", "africa"],
      "burkina faso": ["burkina faso", "burkinabe", "ouagadougou", "africa"],
      "ghana": ["ghana", "ghanaian", "accra", "africa"],
      "togo": ["togo", "togolese", "lome", "africa"],
      "benin": ["benin", "beninese", "porto-novo", "africa"],
      "mali": ["mali", "malian", "bamako", "africa"],
      "niger": ["niger", "nigerien", "niamey", "africa"],
      "nigeria": ["nigeria", "nigerian", "abuja", "africa"],
      "senegal": ["senegal", "senegalese", "dakar", "africa"],
      "gambia": ["gambia", "gambian", "banjul", "africa"],
      "mauritania": ["mauritania", "mauritanian", "nouakchott", "africa"],
      "mali": ["mali", "malian", "bamako", "africa"],
      "western sahara": ["western sahara", "sahrawi", "laayoune", "africa"],

      // Numbers
      "zero": ["0", "zero", "nothing", "none"],
      "one": ["1", "one", "single", "first"],
      "two": ["2", "two", "couple", "second"],
      "three": ["3", "three", "trio", "third"],
      "four": ["4", "four", "quartet", "fourth"],
      "five": ["5", "five", "quintet", "fifth"],
      "six": ["6", "six", "sextet", "sixth"],
      "seven": ["7", "seven", "septet", "seventh"],
      "eight": ["8", "eight", "octet", "eighth"],
      "nine": ["9", "nine", "ninth", "nonet"],
      "ten": ["10", "ten", "perfect", "complete"],
      "hundred": ["100", "hundred", "century", "complete"],
      "thousand": ["1000", "thousand", "kilo", "grand"],
      "million": ["1000000", "million", "mega", "lot"],
      "billion": ["1000000000", "billion", "giga", "huge"],

      // Letters
      "a": ["letter a", "alphabet", "first", "ace"],
      "ab": ["blood type", "ab", "blood", "type"],
      "b": ["letter b", "alphabet", "bee", "second"],
      "c": ["letter c", "alphabet", "sea", "see"],
      "cl": ["cl", "letters", "alphabet", "two"],
      "cool": ["cool", "awesome", "great", "good"],
      "d": ["letter d", "alphabet", "dee", "fourth"],
      "e": ["letter e", "alphabet", "ee", "fifth"],
      "f": ["letter f", "alphabet", "eff", "sixth"],
      "g": ["letter g", "alphabet", "gee", "seventh"],
      "h": ["letter h", "alphabet", "aitch", "eighth"],
      "high voltage": ["electricity", "danger", "high voltage", "power"],
      "i": ["letter i", "alphabet", "eye", "ninth"],
      "id": ["id", "identification", "card", "identity"],
      "information": ["info", "information", "details", "data"],
      "j": ["letter j", "alphabet", "jay", "tenth"],
      "k": ["letter k", "alphabet", "kay", "eleventh"],
      "l": ["letter l", "alphabet", "el", "twelfth"],
      "m": ["letter m", "alphabet", "em", "thirteenth"],
      "n": ["letter n", "alphabet", "en", "fourteenth"],
      "nz": ["new zealand", "nz", "kiwi", "oceania"],
      "o": ["letter o", "alphabet", "oh", "fifteenth"],
      "o2": ["oxygen", "o2", "air", "breathing"],
      "ok": ["ok", "okay", "good", "alright"],
      "p": ["letter p", "alphabet", "pee", "sixteenth"],
      "p button": ["p", "button", "play", "pause"],
      "parking": ["parking", "car", "spot", "vehicle"],
      "parking": ["parking", "car", "spot", "vehicle"],
      "passport control": ["passport", "control", "border", "travel"],
      "pause button": ["pause", "stop", "wait", "halt"],
      "peacock": ["peacock", "bird", "beautiful", "feathers"],
      "peninsula": ["peninsula", "land", "water", "geography"],
      "people hugging": ["hug", "embrace", "love", "affection"],
      "percent": ["percent", "%", "percentage", "symbol"],
      "person gesturing no": ["no", "gesture", "stop", "negative"],
      "person gesturing ok": ["ok", "okay", "good", "gesture"],
      "person raising hand": ["hand", "raise", "volunteer", "ask"],
      "person with ball": ["ball", "play", "sport", "fun"],
      "person with skull": ["skull", "death", "danger", "warning"],
      "ph": ["ph", "acid", "chemistry", "science"],
      "pi": ["pi", "math", "3.14", "mathematics"],
      "plus": ["plus", "+", "add", "positive"],
      "poop": ["poop", "shit", "crap", "feces"],
      "post office": ["post office", "mail", "postal", "japan"],
      "potable water": ["water", "drinking", "potable", "safe"],
      "pound": ["pound", "weight", "currency", "symbol"],
      "prayer beads": ["prayer", "beads", "religious", "meditation"],
      "puerto rico": ["puerto rico", "caribbean", "island", "us territory"],
      "q": ["letter q", "alphabet", "cue", "seventeenth"],
      "r": ["letter r", "alphabet", "are", "eighteenth"],
      "radio": ["radio", "music", "listen", "broadcast"],
      "rainbow flag": ["rainbow", "pride", "lgbt", "gay"],
      "record": ["record", "music", "vinyl", "disc"],
      "registered": ["registered", "trademark", "symbol", "mark"],
      "repeat button": ["repeat", "loop", "again", "replay"],
      "rescue workers helmet": ["rescue", "helmet", "safety", "emergency"],
      "right anger bubble": ["anger", "mad", "furious", "comic"],
      "right speech bubble": ["speech", "talk", "say", "dialogue"],
      "right thought bubble": ["think", "thought", "idea", "mind"],
      "round pushpin": ["pin", "location", "map", "mark"],
      "ru": ["russia", "russian", "moscow", "country"],
      "s": ["letter s", "alphabet", "ess", "nineteenth"],
      "sailboat": ["sail", "boat", "sailing", "water"],
      "sahara": ["sahara", "desert", "africa", "sand"],
      "samosa": ["samosa", "food", "indian", "snack"],
      "santa": ["santa", "christmas", "holiday", "gifts"],
      "satellite": ["satellite", "space", "orbit", "communication"],
      "scales": ["scales", "justice", "balance", "law"],
      "school": ["school", "education", "learn", "study"],
      "scissors": ["scissors", "cut", "sharp", "tool"],
      "scream": ["scream", "scary", "horror", "fear"],
      "scroll": ["scroll", "paper", "document", "ancient"],
      "seal": ["seal", "stamp", "official", "document"],
      "second place": ["second", "runner up", "silver", "place"],
      "secret": ["secret", "hidden", "confidential", "private"],
      "see no evil monkey": ["see no evil", "monkey", "wise", "mizaru"],
      "shallow pan of food": ["paella", "spanish", "rice", "seafood"],
      "shamrock": ["shamrock", "clover", "irish", "luck"],
      "shark": ["shark", "fish", "danger", "ocean"],
      "shark": ["shark", "fish", "danger", "ocean"],
      "shaved ice": ["shaved ice", "dessert", "sweet", "cold"],
      "sheaf of rice": ["rice", "grain", "food", "harvest"],
      "shield": ["shield", "protection", "defense", "armor"],
      "shinto shrine": ["shrine", "japan", "religious", "temple"],
      "ship": ["ship", "boat", "sailing", "transport"],
      "shopping cart": ["shopping", "cart", "buy", "retail"],
      "shower": ["shower", "rain", "water", "clean"],
      "shrimp": ["shrimp", "seafood", "food", "shellfish"],
      "shushing face": ["shh", "quiet", "silence", "secret"],
      "sierra leone": ["sierra leone", "africa", "freetown", "country"],
      "silhouette": ["silhouette", "shadow", "outline", "figure"],
      "singapore": ["singapore", "asia", "city", "country"],
      "sitting person": ["sit", "chair", "rest", "relax"],
      "six": ["6", "six", "half dozen", "number"],
      "skier": ["ski", "snow", "winter", "sport"],
      "skull": ["skull", "death", "danger", "warning"],
      "sleeping": ["sleep", "tired", "rest", "night"],
      "sleepy": ["sleepy", "tired", "yawn", "drowsy"],
      "slightly smiling face": ["smile", "happy", "subtle", "pleasant"],
      "slow": ["slow", "tired", "exhausted", "weak"],
      "small": ["small", "tiny", "little", "mini"],
      "smile": ["smile", "happy", "joy", "grin"],
      "smiling": ["smiling", "happy", "pleasant", "content"],
      "smirking face": ["smirk", "cocky", "smug", "arrogant"],
      "snail": ["snail", "slow", "shell", "slime"],
      "snake": ["snake", "reptile", "slither", "venom"],
      "snow": ["snow", "winter", "cold", "white"],
      "snowflake": ["snowflake", "winter", "ice", "cold"],
      "snowman": ["snowman", "winter", "frosty", "cold"],
      "soap": ["soap", "clean", "wash", "bubbles"],
      "sobbing": ["crying", "sob", "tears", "sad"],
      "soccer": ["soccer", "football", "sport", "ball"],
      "sodium": ["sodium", "na", "salt", "chemistry"],
      "softball": ["softball", "sport", "ball", "game"],
      "soil": ["soil", "dirt", "earth", "ground"],
      "somalia": ["somalia", "africa", "horn of africa", "country"],
      "soon": ["soon", "coming", "future", "later"],
      "south africa": ["south africa", "africa", "country", "rsa"],
      "south sudan": ["south sudan", "africa", "new country", "country"],
      "space": ["space", "universe", "galaxy", "stars"],
      "spade": ["spade", "card", "garden", "dig"],
      "spaghetti": ["spaghetti", "pasta", "italian", "food"],
      "sparkle": ["sparkle", "shine", "glitter", "bright"],
      "sparkles": ["sparkles", "magic", "shine", "glitter"],
      "speak no evil monkey": ["speak no evil", "monkey", "wise", "ikazaru"],
      "sperm": ["sperm", "baby", "conception", "reproduction"],
      "spider": ["spider", "arachnid", "web", "creepy"],
      "spider web": ["spider web", "web", "spider", "sticky"],
      "spiral": ["spiral", "twist", "rotate", "swirl"],
      "spiral shell": ["shell", "seashell", "beach", "spiral"],
      "spoon": ["spoon", "utensil", "eat", "soup"],
      "sport utility vehicle": ["suv", "car", "vehicle", "off-road"],
      "spy": ["spy", "secret", "agent", "covert"],
      "squid": ["squid", "seafood", "tentacles", "ocean"],
      "sri lanka": ["sri lanka", "asia", "island", "country"],
      "stadium": ["stadium", "sports", "arena", "venue"],
      "star": ["star", "celestial", "night", "bright"],
      "star and crescent": ["islam", "muslim", "crescent", "religion"],
      "star-struck": ["starstruck", "amazed", "celebrity", "wow"],
      "stars": ["stars", "night", "sparkle", "celestial"],
      "steaming bowl": ["bowl", "hot", "soup", "ramen"],
      "stop": ["stop", "halt", "cease", "desist"],
      "stop sign": ["stop", "sign", "traffic", "warning"],
      "stopwatch": ["stopwatch", "timer", "time", "sport"],
      "strawberry": ["strawberry", "fruit", "red", "sweet"],
      "street sign": ["sign", "street", "road", "direction"],
      "study": ["study", "learn", "education", "book"],
      "sugar": ["sugar", "sweet", "candy", "dessert"],
      "suit": ["suit", "formal", "business", "professional"],
      "sun": ["sun", "solar", "day", "light"],
      "sunflower": ["sunflower", "flower", "yellow", "summer"],
      "sunglasses": ["sunglasses", "shades", "cool", "sun"],
      "sunrise": ["sunrise", "morning", "dawn", "daybreak"],
      "sunset": ["sunset", "evening", "dusk", "night"],
      "superhero": ["superhero", "hero", "powers", "rescue"],
      "surfer": ["surfer", "surfing", "wave", "ocean"],
      "sushi": ["sushi", "japanese", "fish", "rice"],
      "suspension railway": ["railway", "train", "mountain", "transport"],
      "swan": ["swan", "bird", "elegant", "white"],
      "sweat": ["sweat", "hot", "exercise", "workout"],
      "sweat droplets": ["sweat", "drops", "hot", "effort"],
      "sweating": ["sweating", "hot", "exercise", "workout"],
      "swimmer": ["swimmer", "swimming", "water", "sport"],
      "switzerland": ["switzerland", "europe", "neutral", "alps"],
      "sword": ["sword", "weapon", "blade", "fight"],
      "syringe": ["syringe", "needle", "shot", "medical"],
      "t": ["letter t", "alphabet", "tee", "twentieth"],
      "t-rex": ["t-rex", "dinosaur", "extinct", "prehistoric"],
      "taco": ["taco", "mexican", "food", "spicy"],
      "taj mahal": ["taj mahal", "india", "monument", "love"],
      "takoyaki": ["takoyaki", "japanese", "octopus", "food"],
      "tanabata tree": ["tanabata", "japan", "festival", "wishes"],
      "tangerine": ["tangerine", "orange", "citrus", "fruit"],
      "tanzania": ["tanzania", "africa", "kilimanjaro", "safari"],
      "taxi": ["taxi", "cab", "transport", "ride"],
      "tea": ["tea", "drink", "hot", "british"],
      "teapot": ["teapot", "tea", "hot", "drink"],
      "telephone": ["telephone", "phone", "call", "communication"],
      "telescope": ["telescope", "astronomy", "stars", "space"],
      "television": ["television", "tv", "watch", "media"],
      "temperature": ["temperature", "hot", "cold", "thermometer"],
      "temple": ["temple", "religious", "worship", "sacred"],
      "tennis": ["tennis", "sport", "racket", "ball"],
      "tent": ["tent", "camping", "outdoor", "shelter"],
      "thailand": ["thailand", "asia", "bangkok", "buddhism"],
      "thank you": ["thank you", "thanks", "grateful", "appreciation"],
      "thermometer": ["thermometer", "temperature", "hot", "cold"],
      "thinking": ["thinking", "ponder", "wonder", "contemplate"],
      "third place": ["third", "bronze", "place", "medal"],
      "this": ["this", "current", "present", "now"],
      "thought balloon": ["thought", "think", "idea", "mind"],
      "three": ["3", "three", "trio", "triangle"],
      "thumbs down": ["thumbs down", "dislike", "bad", "no"],
      "thumbs up": ["thumbs up", "like", "good", "yes"],
      "thunder": ["thunder", "storm", "lightning", "loud"],
      "thunderstorm": ["thunderstorm", "storm", "rain", "lightning"],
      "ticket": ["ticket", "entry", "pass", "admission"],
      "tiger": ["tiger", "stripes", "wild", "feline"],
      "timer clock": ["timer", "clock", "time", "countdown"],
      "tipping hand": ["tip", "gratuity", "money", "service"],
      "tired": ["tired", "exhausted", "sleepy", "weary"],
      "tm": ["trademark", "tm", "brand", "logo"],
      "toast": ["toast", "bread", "breakfast", "butter"],
      "toilet": ["toilet", "bathroom", "restroom", "wc"],
      "tokyo tower": ["tokyo tower", "japan", "landmark", "tower"],
      "tomato": ["tomato", "vegetable", "red", "fruit"],
      "tongue": ["tongue", "taste", "mouth", "lick"],
      "tools": ["tools", "workshop", "repair", "fix"],
      "top": ["top", "best", "number one", "first"],
      "top hat": ["top hat", "formal", "magician", "elegant"],
      "tornado": ["tornado", "twister", "storm", "wind"],
      "traffic light": ["traffic light", "stop", "go", "signal"],
      "train": ["train", "railway", "transport", "station"],
      "tram": ["tram", "trolley", "transport", "city"],
      "transgender flag": ["transgender", "trans", "flag", "pride"],
      "transport": ["transport", "travel", "vehicle", "movement"],
      "tree": ["tree", "forest", "nature", "green"],
      "triangular flag": ["flag", "marker", "point", "location"],
      "trident": ["trident", "poseidon", "sea", "weapon"],
      "trident emblem": ["trident", "symbol", "sea", "power"],
      "tropical drink": ["cocktail", "tropical", "umbrella", "drink"],
      "tropical fish": ["fish", "tropical", "colorful", "ocean"],
      "trumpet": ["trumpet", "music", "brass", "instrument"],
      "tshirt": ["tshirt", "shirt", "casual", "clothes"],
      "tulip": ["tulip", "flower", "netherlands", "spring"],
      "tumbleweed": ["tumbleweed", "desert", "west", "wind"],
      "turkey": ["turkey", "thanksgiving", "bird", "food"],
      "turtle": ["turtle", "slow", "shell", "reptile"],
      "tv": ["tv", "television", "watch", "media"],
      "twelve": ["12", "twelve", "dozen", "midnight"],
      "twenty": ["20", "twenty", "score", "fingers"],
      "two": ["2", "two", "couple", "pair"],
      "two hearts": ["two hearts", "love", "romance", "couple"],
      "u": ["letter u", "alphabet", "you", "twenty-first"],
      "u-540e": ["japan", "japanese", "asia", "east"],
      "u-55b6": ["university", "college", "education", "school"],
      "u-6307": ["university", "college", "education", "school"],
      "u-6e80": ["full", "complete", "filled", "maximum"],
      "u-7981": ["forbidden", "prohibited", "not allowed", "no"],
      "u-7a7a": ["free", "freedom", "no charge", "complimentary"],
      "u-9750": ["medicine", "health", "cure", "healing"],
      "u-7acb": ["establishment", "business", "organization", "company"],
      "u-5408": ["agreement", "contract", "deal", "terms"],
      "u-6301": ["examination", "test", "study", "education"],
      "u-6b63": ["correct", "right", "proper", "accurate"],
      "u-4e0d": ["not", "no", "negative", "wrong"],
      "u-53ef": ["can", "possible", "able", "capable"],
      "u-5929": ["sky", "heaven", "day", "weather"],
      "u-5730": ["earth", "ground", "land", "world"],
      "u-5e74": ["year", "annual", "age", "time"],
      "u-5973": ["woman", "female", "lady", "girl"],
      "u-7537": ["man", "male", "guy", "boy"],
      "u-4eba": ["person", "human", "people", "individual"],
      "u-5b50": ["child", "kid", "baby", "young"],
      "u-6bcd": ["mother", "mom", "parent", "family"],
      "u-7236": ["father", "dad", "parent", "family"],
      "u-5148": ["first", "before", "prior", "previous"],
      "u-751f": ["life", "birth", "alive", "living"],
      "u-8001": ["old", "elderly", "senior", "aged"],
      "u-5973": ["woman", "female", "lady", "girl"],
      "u-7537": ["man", "male", "guy", "boy"],
      "u-4eba": ["person", "human", "people", "individual"],
      "u-5b50": ["child", "kid", "baby", "young"],
      "u-6bcd": ["mother", "mom", "parent", "family"],
      "u-7236": ["father", "dad", "parent", "family"],
      "u-5148": ["first", "before", "prior", "previous"],
      "u-751f": ["life", "birth", "alive", "living"],
      "u-8001": ["old", "elderly", "senior", "aged"],
      "u-7236": ["father", "dad", "parent", "family"],
      "u-6bcd": ["mother", "mom", "parent", "family"],
      "u-5148": ["first", "before", "prior", "previous"],
      "u-751f": ["life", "birth", "alive", "living"],
      "u-8001": ["old", "elderly", "senior", "aged"],
      "u-7236": ["father", "dad", "parent", "family"],
      "u-6bcd": ["mother", "mom", "parent", "family"],
      "u-5148": ["first", "before", "prior", "previous"],
      "u-751f": ["life", "birth", "alive", "living"],
      "u-8001": ["old", "elderly", "senior", "aged"],
      "u-7236": ["father", "dad", "parent", "family"],
      "u-6bcd": ["mother", "mom", "parent", "family"],
      "u-5148": ["first", "before", "prior", "previous"],
      "u-751f": ["life", "birth", "alive", "living"],
      "u-8001": ["old", "elderly", "senior", "aged"],
      "uk": ["uk", "britain", "united kingdom", "england"],
      "umbrella": ["umbrella", "rain", "protection", "wet"],
      "un": ["un", "united nations", "organization", "world"],
      "underage": ["underage", "minor", "young", "teen"],
      "unicorn": ["unicorn", "magical", "fantasy", "horn"],
      "united nations": ["un", "united nations", "organization", "peace"],
      "up": ["up", "upside", "above", "higher"],
      "upside-down": ["upside-down", "reversed", "flipped", "opposite"],
      "uruguay": ["uruguay", "south america", "country", "nation"],
      "usa": ["usa", "america", "united states", "country"],
      "v": ["letter v", "alphabet", "vee", "twenty-second"],
      "vegan": ["vegan", "plant-based", "vegetarian", "food"],
      "vegetarian": ["vegetarian", "plant-based", "no meat", "food"],
      "venezuela": ["venezuela", "south america", "country", "nation"],
      "vertical": ["vertical", "upright", "straight", "standing"],
      "victory": ["victory", "win", "success", "triumph"],
      "vietnam": ["vietnam", "asia", "country", "nation"],
      "video game": ["video game", "gaming", "play", "entertainment"],
      "violin": ["violin", "instrument", "music", "orchestra"],
      "virgo": ["virgo", "zodiac", "astrology", "star sign"],
      "volcano": ["volcano", "eruption", "lava", "mountain"],
      "volleyball": ["volleyball", "sport", "net", "ball"],
      "vs": ["vs", "versus", "against", "competition"],
      "vulcan salute": ["vulcan", "spock", "star trek", "live long"],
      "w": ["letter w", "alphabet", "double-u", "twenty-third"],
      "walking": ["walking", "hike", "stroll", "move"],
      "wallet": ["wallet", "money", "cash", "cards"],
      "waning crescent moon": ["moon", "crescent", "night", "shrinking"],
      "waning gibbous moon": ["moon", "gibbous", "night", "shrinking"],
      "warning": ["warning", "caution", "danger", "alert"],
      "wash": ["wash", "clean", "soap", "water"],
      "watch": ["watch", "time", "clock", "wrist"],
      "water": ["water", "h2o", "liquid", "drink"],
      "water buffalo": ["buffalo", "animal", "water", "asia"],
      "water closet": ["wc", "toilet", "bathroom", "restroom"],
      "water gun": ["water gun", "squirt", "toy", "summer"],
      "watermelon": ["watermelon", "fruit", "summer", "red"],
      "wave": ["wave", "ocean", "water", "motion"],
      "waving hand": ["wave", "hello", "goodbye", "greeting"],
      "waxing crescent moon": ["moon", "crescent", "night", "growing"],
      "waxing gibbous moon": ["moon", "gibbous", "night", "growing"],
      "wc": ["wc", "toilet", "bathroom", "restroom"],
      "wear": ["wear", "clothes", "dress", "outfit"],
      "weather": ["weather", "climate", "rain", "sun"],
      "wedding": ["wedding", "marriage", "couple", "ceremony"],
      "weight": ["weight", "heavy", "mass", "pounds"],
      "west": ["west", "western", "direction", "left"],
      "whale": ["whale", "ocean", "sea", "mammal"],
      "wheel": ["wheel", "car", "transport", "motion"],
      "wheelchair": ["wheelchair", "disability", "accessibility", "chair"],
      "whiskey": ["whiskey", "alcohol", "drink", "spirit"],
      "white flower": ["flower", "white", "bloom", "garden"],
      "white square": ["square", "white", "shape", "geometric"],
      "white sun": ["sun", "bright", "light", "day"],
      "white": ["white", "color", "pure", "clean"],
      "wifi": ["wifi", "wireless", "internet", "connection"],
      "wind": ["wind", "breeze", "air", "movement"],
      "wind chime": ["wind chime", "chime", "sound", "breeze"],
      "window": ["window", "glass", "view", "light"],
      "wine": ["wine", "alcohol", "drink", "grapes"],
      "wink": ["wink", "eye", "flirt", "joke"],
      "winner": ["winner", "victory", "champion", "first"],
      "winter": ["winter", "cold", "snow", "freeze"],
      "wise": ["wise", "smart", "intelligent", "clever"],
      "woman": ["woman", "female", "lady", "girl"],
      "wonder": ["wonder", "amaze", "surprise", "marvel"],
      "world": ["world", "earth", "globe", "planet"],
      "wound": ["wound", "injury", "cut", "hurt"],
      "wreath": ["wreath", "circle", "decoration", "flower"],
      "wrong": ["wrong", "incorrect", "mistake", "error"],
      "x": ["letter x", "alphabet", "ex", "twenty-fourth"],
      "y": ["letter y", "alphabet", "why", "twenty-fifth"],
      "yarn": ["yarn", "knit", "wool", "craft"],
      "yellow": ["yellow", "color", "sun", "lemon"],
      "yen": ["yen", "japan", "money", "currency"],
      "yes": ["yes", "okay", "correct", "positive"],
      "yoga": ["yoga", "exercise", "stretch", "meditation"],
      "yuan": ["yuan", "china", "money", "currency"],
      "yummy": ["yummy", "delicious", "tasty", "good"],
      "z": ["letter z", "alphabet", "zed", "twenty-sixth"],
      "zap": ["zap", "electric", "shock", "power"],
      "zebra": ["zebra", "animal", "stripes", "africa"],
      "zero": ["zero", "0", "nothing", "none"],
      "zodiac": ["zodiac", "astrology", "star sign", "horoscope"],
      "zombie": ["zombie", "undead", "horror", "walking dead"],
      "zone": ["zone", "area", "section", "region"]
    }

    // Apply comprehensive emoji mapping
    for (const [key, relatedWords] of Object.entries(commonEmojiMap)) {
      if (nameLower === key || nameLower.includes(key)) {
        keywords.push(...relatedWords)
      }
    }

    // Group-specific enhanced keywords
    const groupKeywords = {
      "Smileys & Emotion": [
        "emotion", "feeling", "mood", "face", "expression", "reaction",
        "happy", "sad", "angry", "surprised", "confused", "love", "hate",
        "laugh", "cry", "smile", "frown", "wink", "kiss", "hug", "emoji"
      ],
      "People & Body": [
        "person", "people", "human", "body", "hand", "foot", "head",
        "man", "woman", "boy", "girl", "baby", "family", "friend",
        "gesture", "movement", "pose", "action", "activity", "couple"
      ],
      "Animals & Nature": [
        "animal", "pet", "wild", "nature", "plant", "flower", "tree",
        "weather", "season", "environment", "outdoor", "garden", "cute",
        "cat", "dog", "bird", "fish", "insect", "ocean", "forest", "cute"
      ],
      "Food & Drink": [
        "food", "eat", "drink", "meal", "hungry", "thirsty", "delicious",
        "cooking", "kitchen", "restaurant", "recipe", "ingredient", "yummy",
        "breakfast", "lunch", "dinner", "snack", "dessert", "sweet", "tasty"
      ],
      "Travel & Places": [
        "travel", "trip", "vacation", "journey", "adventure", "explore",
        "place", "location", "destination", "city", "country", "world",
        "car", "plane", "train", "boat", "hotel", "beach", "mountain", "map"
      ],
      "Activities": [
        "sport", "game", "play", "fun", "hobby", "exercise", "workout",
        "music", "dance", "art", "party", "celebration", "competition",
        "running", "swimming", "playing", "winning", "team", "win"
      ],
      "Objects": [
        "object", "thing", "item", "stuff", "tool", "device", "technology",
        "phone", "computer", "camera", "clock", "money", "car", "house",
        "book", "clothes", "furniture", "toy", "gift", "present", "stuff"
      ],
      "Symbols": [
        "symbol", "sign", "icon", "mark", "indicator", "warning", "arrow",
        "heart", "star", "check", "cross", "plus", "minus", "number",
        "letter", "shape", "color", "flag", "math", "time"
      ],
      "Flags": [
        "flag", "country", "nation", "national", "patriotic", "world",
        "america", "europe", "asia", "africa", "international", "pride",
        "symbol", "banner", "emblem", "nation"
      ]
    }

    if (groupKeywords[group]) {
      keywords.push(...groupKeywords[group])
    }

    // Add seasonal and festive keywords
    if (nameLower.includes("snow") || nameLower.includes("winter") || nameLower.includes("cold")) {
      keywords.push("winter", "seasonal", "cold", "snow", "ice", "frozen", "christmas", "holiday")
    }
    if (nameLower.includes("sun") || nameLower.includes("summer") || nameLower.includes("hot")) {
      keywords.push("summer", "seasonal", "hot", "sunny", "warm", "beach", "vacation")
    }
    if (nameLower.includes("spring") || nameLower.includes("blossom") || nameLower.includes("flower")) {
      keywords.push("spring", "seasonal", "bloom", "growth", "fresh", "new")
    }
    if (nameLower.includes("autumn") || nameLower.includes("fall") || nameLower.includes("leaf")) {
      keywords.push("autumn", "fall", "seasonal", "harvest", "orange", "red")
    }

    // Add festive keywords
    if (
      nameLower.includes("party") ||
      nameLower.includes("celebration") ||
      nameLower.includes("birthday") ||
      nameLower.includes("gift") ||
      nameLower.includes("balloon") ||
      nameLower.includes("confetti")
    ) {
      keywords.push("festive", "party", "celebration", "birthday", "holiday", "fun", "exciting")
    }

    // Remove duplicates and return
    return [...new Set(keywords)]
  }

  generateDescription(name) {
    const descriptions = {
      "grinning face": "A cheerful, happy face showing teeth in a big smile.",
      "face with tears of joy": "Laughing so hard that tears come out - pure joy!",
      "red heart": "The classic symbol of love and affection.",
      "thumbs up": "A gesture showing approval, agreement, or encouragement.",
      fire: "Represents something hot, trending, or amazing.",
      pizza: "Everyone's favorite cheesy, delicious comfort food.",
      "dog face": "Man's best friend - loyal, loving, and adorable.",
      sun: "The bright star that lights up our day.",
      rainbow: "A beautiful arc of colors after the rain.",
      "party popper": "Time to celebrate! Perfect for parties and special occasions.",
      "birthday cake": "Make a wish! The perfect symbol for birthdays and celebrations.",
      "cherry blossom": "Beautiful pink flowers that symbolize spring and renewal.",
      snowflake: "Each one is unique, just like you! Perfect for winter vibes.",
      airplane: "Ready for takeoff! Perfect for travel and adventure posts.",
      "soccer ball": "The world's most popular sport in emoji form.",
      guitar: "Make some music! Perfect for musicians and music lovers.",
      camera: "Capture the moment! Great for photography enthusiasts.",
      "flag united states": "The flag of the United States of America - stars and stripes forever!",
      "flag united kingdom": "The Union Jack - representing England, Scotland, Wales, and Northern Ireland.",
      "flag france": "The tricolor flag of France - liberté, égalité, fraternité!",
      "flag germany": "The flag of Germany with its distinctive black, red, and gold stripes.",
      "flag japan": "The rising sun flag of Japan - simple and iconic.",
      "flag china": "The five-star red flag of the People's Republic of China.",
      "flag canada": "The maple leaf flag of Canada - proud and distinctive.",
      "flag australia": "The Southern Cross and Union Jack on blue - representing Australia.",
      "flag brazil": "The green and yellow flag of Brazil with its starry blue globe.",
      "flag india": "The tricolor flag of India with the Ashoka Chakra wheel.",
      "white flag": "Universal symbol of surrender, peace, or truce.",
      "rainbow flag": "Symbol of LGBTQ+ pride and diversity.",
      "pirate flag": "Jolly Roger - the classic skull and crossbones pirate flag!",
    }

    return (
      descriptions[name.toLowerCase()] ||
      `A ${name.toLowerCase()} emoji that adds personality and emotion to your messages.`
    )
  }

  generateUsage(name, group) {
    const usageMap = {
      "Smileys & Emotion": "Perfect for expressing emotions and reactions in conversations.",
      "People & Body": "Great for representing people, actions, and body language.",
      "Animals & Nature": "Use when talking about animals, nature, or the outdoors.",
      "Food & Drink": "Ideal for food posts, restaurant reviews, or when you're hungry!",
      "Travel & Places": "Perfect for travel posts, location sharing, or vacation planning.",
      Activities: "Use when discussing sports, hobbies, or fun activities.",
      Objects: "Great for representing everyday items and tools.",
      Symbols: "Perfect for adding symbolic meaning to your messages.",
      Flags: "Use to represent countries, show patriotism, or indicate nationality and international topics.",
    }

    // Special usage cases
    if (name.includes("party") || name.includes("celebration") || name.includes("birthday")) {
      return "Perfect for celebrations, parties, birthdays, and festive occasions!"
    }
    if (name.includes("heart")) {
      return "Express love, affection, and positive emotions in your messages."
    }
    if (name.includes("snow") || name.includes("winter")) {
      return "Great for winter posts, holiday greetings, and seasonal content."
    }
    if (name.includes("sun") || name.includes("summer")) {
      return "Perfect for summer vibes, sunny days, and positive energy."
    }
    if (name.includes("flag")) {
      return "Perfect for showing national pride, international topics, or representing your country!"
    }

    return usageMap[group] || "A versatile emoji that can add personality to your messages."
  }

  setupEventListeners() {
    // Navigation tabs scroll functionality
    this.setupNavTabsScroll()

    // Smart scroll behavior for search dropdown
    this.setupSmartScroll()

    // Search functionality
    const searchInput = document.getElementById("searchInput")
    const searchSuggestions = document.getElementById("searchSuggestions")

    searchInput.addEventListener("input", (e) => {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.handleSearch(e.target.value)
      }, 150)
    })

    searchInput.addEventListener("focus", () => {
      if (searchInput.value.trim()) {
        this.showSuggestions(searchInput.value)
      }
      this.positionSearchSuggestions()
    })

    // Position search suggestions on window resize
    window.addEventListener("resize", this.positionSearchSuggestions.bind(this))

    // Hide suggestions when clicking outside
    document.addEventListener("click", (e) => {
      if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
        searchSuggestions.classList.remove("show")
      }
    })

    // Tab navigation - improved event handling
    const navTabs = document.getElementById("navTabs")
    navTabs.addEventListener("click", (e) => {
      // Handle both direct clicks and clicks on child elements
      const tab = e.target.closest(".nav-tab")
      if (tab) {
        e.preventDefault()
        e.stopPropagation()
        this.handleTabClick(tab)
      }
    })

    // Also handle touch events for mobile
    navTabs.addEventListener("touchend", (e) => {
      const tab = e.target.closest(".nav-tab")
      if (tab) {
        e.preventDefault()
        this.handleTabClick(tab)
      }
    })

    // Modal functionality
    document.getElementById("closeBtn").addEventListener("click", () => {
      this.closeModal()
    })

    document.getElementById("modalOverlay").addEventListener("click", (e) => {
      if (e.target.id === "modalOverlay") {
        this.closeModal()
      }
    })

    document.getElementById("copyBtn").addEventListener("click", () => {
      this.copyEmoji()
    })

    // Keyboard shortcuts and auto-focus
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeModal()
        document.getElementById("searchSuggestions").classList.remove("show")
      }
      if (e.key === "/" && !e.target.matches("input")) {
        e.preventDefault()
        searchInput.focus()
      }

      // Auto-focus search box on any typing when not in an input
      if (!e.target.matches("input, textarea, [contenteditable]") &&
          e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Don't capture single character shortcuts like / or space
        if (e.key !== "/" && e.key !== " " && e.key !== "Escape") {
          e.preventDefault()
          searchInput.focus()
          searchInput.value += e.key
          this.handleSearch(searchInput.value)
        }
      }
    })

    // Footer scroll detection
    this.setupFooterScroll()
  }

  handleSearch(query) {
    if (!query.trim()) {
      this.filteredEmojis = this.getEmojisByCategory(this.currentCategory)
      this.renderEmojis()
      document.getElementById("searchSuggestions").classList.remove("show")
      return
    }

    // Store previous category when starting a search (but only if not already searching)
    if (this.currentCategory !== "search") {
      this.previousCategory = this.currentCategory
      this.currentCategory = "search"
    }

    const searchTerm = query.toLowerCase().trim()

    // Performance: Cache special search results
    if (searchTerm === 'sad') {
      this.filteredEmojis = this.getSadEmojis()
      this.renderEmojis()
      return
    }

    this.showSuggestions(query)

    // Performance: Use efficient search with early returns
    const filtered = this.emojis.filter((emoji) => {
      const nameMatch = emoji.name.toLowerCase().includes(searchTerm)
      if (nameMatch) return true

      // Check keywords if they exist
      if (emoji.keywords) {
        return emoji.keywords.some((keyword) => keyword.includes(searchTerm))
      }

      return false
    })

    this.filteredEmojis = filtered
    this.renderEmojis()
  }

  getSadEmojis() {
    // Cache sad emojis for performance
    if (!this.sadEmojisCache) {
      const sadKeywords = ["sad", "cry", "tears", "tear", "sob", "pensive", "disappointed", "weary", "tired", "anguished", "confused", "frown", "downcast", "worried", "fear", "scream", "persevering", "confounded", "unamused", "expressionless", "neutral", "grimace", "sleepy", "sleeping", "dizzy", "nauseated", "vomit", "sick", "hurt", "pain", "upset", "depressed", "broken heart", "heartbreak", "crying", "loudly crying", "sad but relieved"]
      const happyKeywords = ["happy", "smile", "laugh", "joy", "cheer", "grin", "glee"]

      this.sadEmojisCache = this.emojis.filter((emoji) => {
        const hasSadKeyword = sadKeywords.some((kw) =>
          emoji.name.toLowerCase().includes(kw) ||
          (emoji.keywords && emoji.keywords.includes(kw))
        )

        const hasHappyKeyword = happyKeywords.some((kw) =>
          emoji.name.toLowerCase().includes(kw) ||
          (emoji.keywords && emoji.keywords.includes(kw))
        )

        return hasSadKeyword && !hasHappyKeyword
      })
    }

    return this.sadEmojisCache
  }

  showSuggestions(query) {
    if (!query.trim()) {
      document.getElementById("searchSuggestions").classList.remove("show")
      return
    }

    const suggestions = this.emojis
      .filter(
        (emoji) =>
          emoji.name.toLowerCase().includes(query.toLowerCase()) ||
          emoji.keywords.some((keyword) => keyword.includes(query.toLowerCase())),
      )
      .slice(0, 8)

    const suggestionsHtml = suggestions
      .map(
        (emoji) => `
<div class="suggestion-item" data-emoji='${JSON.stringify(emoji)}'>
    <span class="suggestion-emoji">${emoji.emoji}</span>
    <div class="suggestion-text">
        <div class="suggestion-name">${emoji.name}</div>
        <div class="suggestion-keywords">${emoji.keywords
          .slice(0, 3)
          .map((keyword) => `<span class="keyword" data-keyword="${keyword}">${keyword}</span>`)
          .join(", ")}</div>
    </div>
</div>
`,
      )
      .join("")

    const suggestionsContainer = document.getElementById("searchSuggestions")
    suggestionsContainer.innerHTML = `<div class="search-suggestions-content">${suggestionsHtml}</div>`
    suggestionsContainer.classList.add("show")
    this.positionSearchSuggestions()

    // Add click listeners to suggestions
    suggestionsContainer.querySelectorAll(".suggestion-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        // Prevent event if clicking on keyword
        if (e.target.classList.contains("keyword")) return

        const emoji = JSON.parse(item.dataset.emoji)
        this.showEmojiDetail(emoji)
        suggestionsContainer.classList.remove("show")
        document.getElementById("searchInput").value = ""
      })
    })

    // Add click listeners to keywords
    suggestionsContainer.querySelectorAll(".keyword").forEach((keyword) => {
      keyword.addEventListener("click", (e) => {
        e.stopPropagation()
        const searchTerm = keyword.dataset.keyword
        document.getElementById("searchInput").value = searchTerm
        this.handleSearch(searchTerm)
        suggestionsContainer.classList.remove("show")
      })
    })
  }

  positionSearchSuggestions() {
    const searchInput = document.getElementById("searchInput")
    const searchSuggestions = document.getElementById("searchSuggestions")

    if (!searchInput || !searchSuggestions) return

    const rect = searchInput.getBoundingClientRect()
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop

    // Position the suggestions below the search input
    searchSuggestions.style.top = `${rect.bottom + scrollTop + 8}px`
    searchSuggestions.style.left = `${rect.left}px`
    searchSuggestions.style.width = `${rect.width}px`
  }

  handleTabClick(tab) {
    console.log('Tab clicked:', tab.dataset.category, tab)

    // Prevent if already active
    if (tab.classList.contains('active')) {
      console.log('Tab already active, returning')
      return;
    }

    // Store previous category
    this.previousCategory = this.currentCategory

    // Update active tab
    document.querySelectorAll(".nav-tab").forEach((t) => t.classList.remove("active"))
    tab.classList.add("active")

    // Update category and filter emojis
    this.currentCategory = tab.dataset.category
    console.log('Setting category to:', this.currentCategory)

    this.filteredEmojis = this.getEmojisByCategory(this.currentCategory)
    console.log('Filtered emojis count:', this.filteredEmojis.length)

    this.renderEmojis()

    // Clear search
    const searchInput = document.getElementById("searchInput")
    searchInput.value = ""
    document.getElementById("searchSuggestions").classList.remove("show")

    // Scroll to top of grid with proper offset
    const emojiGrid = document.getElementById('emojiGrid')
    const isMobile = window.innerWidth <= 768
    const offset = isMobile ? 160 : 100 // Adjusted offset for mobile header
    const gridPosition = emojiGrid.getBoundingClientRect().top + window.pageYOffset - offset
    if (isMobile) {
      window.scrollTo({ top: gridPosition, behavior: 'auto' })
    } else {
      window.scrollTo({ top: gridPosition, behavior: 'smooth' })
    }
  }

  getEmojisByCategory(category) {
    if (category === "all") return [...this.emojis]

    // Direct category match - just filter by group name
    const filtered = this.emojis.filter((emoji) => emoji.group === category)

    // Debug: log which category and how many emojis
    console.log('Category:', category, 'Emojis:', filtered.length)

    // Additional debug: show all available groups
    if (filtered.length === 0) {
      const availableGroups = [...new Set(this.emojis.map(e => e.group))]
      console.log('Available groups:', availableGroups)
      console.log('Looking for exact match:', `"${category}"`)

      // Try case-insensitive match as fallback
      const caseInsensitive = this.emojis.filter((emoji) =>
        emoji.group.toLowerCase() === category.toLowerCase()
      )
      console.log('Case-insensitive match:', caseInsensitive.length)
      if (caseInsensitive.length > 0) {
        console.log('Using case-insensitive match for:', category)
        return caseInsensitive
      }
    }

    return filtered
  }

  renderEmojis() {
    const grid = document.getElementById("emojiGrid")

    // Performance: Clear existing content efficiently
    while (grid.firstChild) {
      grid.removeChild(grid.firstChild)
    }

    // Handle empty state
    if (this.filteredEmojis.length === 0) {
      this.showEmptyState()
      return
    }

    // Responsive: Show appropriate number of emojis with virtualization
    const isMobile = window.innerWidth <= 768
    const maxEmojis = (this.maxEmojis || (isMobile ? 200 : 150))
    const emojisToShow = this.filteredEmojis.slice(0, maxEmojis)

    // Show more button if there are more emojis
    const hasMore = this.filteredEmojis.length > maxEmojis

    // Performance: Use DocumentFragment for batch DOM operations
    const fragment = document.createDocumentFragment()

    // Create cards in batches for better performance
    emojisToShow.forEach((emoji, index) => {
      if (!emoji || !emoji.emoji || !emoji.name) {
        console.warn('Emoji data missing for card:', emoji)
        return
      }

      const minimal = {emoji: emoji.emoji, name: emoji.name, group: emoji.group}

      // Create elements efficiently
      const card = document.createElement('div')
      card.className = 'emoji-card fade-in-up'
      card.style.animationDelay = `${Math.min(index * 0.01, 0.5)}s` // Cap animation delay
      card.dataset.emoji = encodeURIComponent(JSON.stringify(minimal))

      const emojiDisplay = document.createElement('div')
      emojiDisplay.className = 'emoji-display'
      emojiDisplay.textContent = emoji.emoji

      const emojiName = document.createElement('div')
      emojiName.className = 'emoji-name'
      emojiName.textContent = emoji.name

      const copyBtn = document.createElement('button')
      copyBtn.className = 'quick-copy-btn'
      copyBtn.dataset.emoji = emoji.emoji
      copyBtn.textContent = '📋 Copy'

      card.appendChild(emojiDisplay)
      card.appendChild(emojiName)
      card.appendChild(copyBtn)
      fragment.appendChild(card)
    })

    // Add "load more" button if needed
    if (hasMore) {
      const loadMoreBtn = document.createElement('button')
      loadMoreBtn.className = 'load-more-btn'
      loadMoreBtn.textContent = `Load More (${this.filteredEmojis.length - maxEmojis} remaining)`
      loadMoreBtn.style.cssText = `
        grid-column: 1 / -1;
        padding: 1rem 2rem;
        background: var(--accent-gradient);
        border: none;
        border-radius: var(--border-radius-medium);
        color: white;
        font-weight: 600;
        cursor: pointer;
        transition: all var(--transition-smooth);
        margin: 1rem 0;
      `
      loadMoreBtn.addEventListener('click', () => this.loadMoreEmojis())
      fragment.appendChild(loadMoreBtn)
    }

    grid.appendChild(fragment)

    // Performance: Use event delegation instead of individual listeners
    if (!this.gridClickListenerAdded) {
      grid.addEventListener('click', (e) => {
        const card = e.target.closest('.emoji-card')
        if (!card) return

        if (e.target.classList.contains('quick-copy-btn')) {
          this.handleQuickCopy(e.target)
          return
        }

        this.handleCardClick(card)
      })
      this.gridClickListenerAdded = true
    }
  }

  showEmptyState() {
    const grid = document.getElementById("emojiGrid")
    const searchInput = document.getElementById("searchInput")
    const isSearching = searchInput && searchInput.value.trim()

    const emptyState = document.createElement('div')
    emptyState.className = 'empty-state'
    emptyState.innerHTML = `
      <div class="empty-state-icon">${isSearching ? '🔍' : '😕'}</div>
      <div class="empty-state-title">${isSearching ? 'No emojis found' : 'No emojis in this category'}</div>
      <div class="empty-state-text">
        ${isSearching
          ? `No emojis match "${searchInput.value}". Try different keywords or browse categories.`
          : 'This category is empty. Try selecting a different category or search for specific emojis.'
        }
      </div>
      ${isSearching ? '<button class="clear-search-btn" onclick="window.emojiApp.clearSearchAndReturnToCategory()">Clear Search</button>' : ''}
    `

    grid.appendChild(emptyState)
  }

  loadMoreEmojis() {
    // Increase the limit and re-render
    const isMobile = window.innerWidth <= 768
    this.maxEmojis = (this.maxEmojis || (isMobile ? 200 : 150)) + 100
    this.renderEmojis()
  }

  handleCardClick(card) {
    try {
      const emojiData = card.dataset.emoji
      if (!emojiData) {
        console.error('No data-emoji attribute found on card:', card)
        return
      }

      const minimal = JSON.parse(decodeURIComponent(emojiData))
      const emoji = this.emojis.find(e =>
        e.emoji === minimal.emoji &&
        e.name === minimal.name &&
        e.group === minimal.group
      )

      if (!emoji) {
        console.error('Full emoji object not found for:', minimal)
        return
      }

      this.showEmojiDetail(emoji)
    } catch (err) {
      console.error('Failed to open modal for card:', card, err)
    }
  }

  async handleQuickCopy(btn) {
    const emoji = btn.dataset.emoji
    try {
      await navigator.clipboard.writeText(emoji)
      btn.textContent = "✅ Copied!"
      setTimeout(() => {
        btn.textContent = "📋 Copy"
      }, 2000)
    } catch (err) {
      console.error("Failed to copy emoji:", err)
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = emoji
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      btn.textContent = "✅ Copied!"
      setTimeout(() => {
        btn.textContent = "📋 Copy"
      }, 2000)
    }
  }

  showEmojiDetail(emoji) {
    document.getElementById("modalEmoji").textContent = emoji.emoji
    document.getElementById("modalName").textContent = emoji.name
    document.getElementById("modalDescription").textContent = emoji.description
    document.getElementById("modalUsage").textContent = emoji.usage

    // Keywords (make clickable)
    const keywordsHtml = emoji.keywords
      .slice(0, 8)
      .map((keyword) => `<span class=\"keyword-tag modal-keyword\" data-keyword=\"${keyword}\">${keyword}</span>`)
      .join("")
    document.getElementById("modalKeywords").innerHTML = keywordsHtml

    // Add click listeners to modal keywords
    document.querySelectorAll('.modal-keyword').forEach((el) => {
      el.addEventListener('click', (e) => {
        const keyword = el.dataset.keyword
        this.handleKeywordClick(keyword)
        this.closeModal()
      })
    })

    // Related emojis
    const related = this.getRelatedEmojis(emoji)
    const relatedHtml = related
      .map(
        (relatedEmoji) => {
          const minimal = {emoji: relatedEmoji.emoji, name: relatedEmoji.name, group: relatedEmoji.group};
          return `<div class=\"related-emoji\" data-emoji='${encodeURIComponent(JSON.stringify(minimal))}'>${relatedEmoji.emoji}</div>`;
        }
      )
      .join("")
    document.getElementById("relatedEmojis").innerHTML = relatedHtml

    // Add click listeners to related emojis
    document
      .getElementById("relatedEmojis")
      .querySelectorAll(".related-emoji")
      .forEach((item) => {
        item.addEventListener("click", () => {
          const minimal = JSON.parse(decodeURIComponent(item.dataset.emoji));
          const relatedEmoji = this.emojis.find(e => e.emoji === minimal.emoji && e.name === minimal.name && e.group === minimal.group);
          if (!relatedEmoji) {
            console.error('Full related emoji object not found for:', minimal);
            alert('Related emoji data not found. See console for details.');
            return;
          }
          this.showEmojiDetail(relatedEmoji)
        })
      })

    this.currentEmoji = emoji
    document.getElementById("modalOverlay").classList.add("show")

    // Prevent background scroll and save scroll position
    this.modalScrollPosition = window.pageYOffset
    document.body.style.position = 'fixed'
    document.body.style.top = `-${this.modalScrollPosition}px`
    document.body.style.width = 'calc(100vw - 8px)' // Account for scrollbar
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    // Add global wheel event listener to prevent background scrolling
    this.preventModalScroll = (e) => {
      const modalOverlay = document.getElementById('modalOverlay')

      // Check if modal is open
      if (!modalOverlay.classList.contains('show')) {
        return
      }

      // Check if the event target is inside the modal
      let target = e.target
      while (target && target !== document.body) {
        if (target === modalOverlay) {
          // Allow scrolling within modal
          return
        }
        target = target.parentNode
      }

      // Prevent background scrolling
      e.preventDefault()
      e.stopPropagation()
    }
    document.addEventListener('wheel', this.preventModalScroll, { passive: false })
    document.addEventListener('touchmove', this.preventModalScroll, { passive: false })
  }

  handleKeywordClick(keyword) {
    // Filter emojis by keyword and show in grid
    this.filteredEmojis = this.emojis.filter(
      (emoji) => emoji.keywords && emoji.keywords.includes(keyword)
    )
    this.renderEmojis()
    // Optionally, scroll to grid
    document.getElementById('emojiGrid').scrollIntoView({ behavior: 'smooth' })
  }

  getRelatedEmojis(emoji) {
    return this.emojis.filter((e) => e.group === emoji.group && e.emoji !== emoji.emoji).slice(0, 12)
  }

  closeModal() {
    document.getElementById("modalOverlay").classList.remove("show")
    document.getElementById("copyBtn").classList.remove("copied")
    document.getElementById("copyBtn").innerHTML = "📋 Copy Emoji"

    // Restore background scroll and position
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    document.body.style.overflow = ''
    document.documentElement.style.overflow = ''

    // Remove global scroll prevention listeners
    if (this.preventModalScroll) {
      document.removeEventListener('wheel', this.preventModalScroll)
      document.removeEventListener('touchmove', this.preventModalScroll)
      this.preventModalScroll = null
    }

    // Restore scroll position
    if (this.modalScrollPosition !== undefined) {
      window.scrollTo(0, this.modalScrollPosition)
      this.modalScrollPosition = undefined
    }
  }

  async copyEmoji() {
    if (!this.currentEmoji) return

    try {
      await navigator.clipboard.writeText(this.currentEmoji.emoji)
      const btn = document.getElementById("copyBtn")
      btn.classList.add("copied")
      btn.innerHTML = "✅ Copied!"

      setTimeout(() => {
        btn.classList.remove("copied")
        btn.innerHTML = "📋 Copy Emoji"
      }, 2000)
    } catch (err) {
      console.error("Failed to copy emoji:", err)
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = this.currentEmoji.emoji
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)

      const btn = document.getElementById("copyBtn")
      btn.classList.add("copied")
      btn.innerHTML = "✅ Copied!"

      setTimeout(() => {
        btn.classList.remove("copied")
        btn.innerHTML = "📋 Copy Emoji"
      }, 2000)
    }
  }

  clearSearchAndReturnToCategory() {
    // Clear search input
    const searchInput = document.getElementById("searchInput")
    searchInput.value = ""
    document.getElementById("searchSuggestions").classList.remove("show")

    // Return to previous category
    this.currentCategory = this.previousCategory

    // Find and activate the corresponding tab
    document.querySelectorAll(".nav-tab").forEach((t) => t.classList.remove("active"))
    const targetTab = document.querySelector(`[data-category="${this.currentCategory}"]`)
    if (targetTab) {
      targetTab.classList.add("active")
    }

    // Filter and render emojis
    this.filteredEmojis = this.getEmojisByCategory(this.currentCategory)
    this.renderEmojis()

    // Scroll to top of grid with proper offset
    const emojiGrid = document.getElementById('emojiGrid')
    const isMobile = window.innerWidth <= 768
    const offset = isMobile ? 160 : 100 // Consistent with handleTabClick
    const gridPosition = emojiGrid.getBoundingClientRect().top + window.pageYOffset - offset
    if (isMobile) {
      window.scrollTo({ top: gridPosition, behavior: 'auto' })
    } else {
      window.scrollTo({ top: gridPosition, behavior: 'smooth' })
    }
  }

  setupSmartScroll() {
    const searchSuggestions = document.getElementById("searchSuggestions")
    const searchInput = document.getElementById("searchInput")
    let isOverDropdown = false
    let preventBodyScroll = false

    // Mouse events for desktop
    const handleMouseEnterDropdown = () => {
      isOverDropdown = true
      preventBodyScroll = true
      document.body.style.overflow = 'hidden'
      searchSuggestions.style.overflowY = 'auto'
    }

    const handleMouseLeaveDropdown = () => {
      isOverDropdown = false
      setTimeout(() => {
        if (!isOverDropdown) {
          preventBodyScroll = false
          document.body.style.overflow = ''
        }
      }, 100)
    }

    searchSuggestions.addEventListener('mouseenter', handleMouseEnterDropdown)
    searchSuggestions.addEventListener('mouseleave', handleMouseLeaveDropdown)

    // Touch events for mobile
    const handleTouchStart = (e) => {
      // Don't interfere if modal is open
      const modalOverlay = document.getElementById('modalOverlay')
      if (modalOverlay && modalOverlay.classList.contains('show')) {
        return
      }

      const touch = e.touches[0]
      const element = document.elementFromPoint(touch.clientX, touch.clientY)

      if (searchSuggestions.contains(element) || searchSuggestions === element) {
        preventBodyScroll = true
        searchSuggestions.style.overflowY = 'auto'

        // Prevent body scroll
        document.body.style.position = 'fixed'
        document.body.style.top = `-${window.scrollY}px`
        document.body.style.width = '100%'
      }
    }

    const handleTouchEnd = () => {
      // Don't interfere if modal is open
      const modalOverlay = document.getElementById('modalOverlay')
      if (modalOverlay && modalOverlay.classList.contains('show')) {
        return
      }

      setTimeout(() => {
        preventBodyScroll = false
        searchSuggestions.style.overflowY = 'auto'

        // Restore body scroll
        const scrollY = document.body.style.top
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        window.scrollTo(0, parseInt(scrollY || '0') * -1)
      }, 150)
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: false })
    document.addEventListener('touchend', handleTouchEnd, { passive: false })

    // Handle scroll events on the dropdown
    searchSuggestions.addEventListener('wheel', (e) => {
      // Don't interfere if modal is open
      const modalOverlay = document.getElementById('modalOverlay')
      if (modalOverlay && modalOverlay.classList.contains('show')) {
        return
      }

      if (preventBodyScroll) {
        e.stopPropagation()
      }
    }, { passive: false })

    // Clean up when dropdown is hidden
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          if (!searchSuggestions.classList.contains('show')) {
            preventBodyScroll = false
            document.body.style.overflow = ''
            document.body.style.position = ''
            document.body.style.top = ''
            document.body.style.width = ''
          }
        }
      })
    })

    observer.observe(searchSuggestions, { attributes: true })
  }

  setupFooterScroll() {
    const footer = document.getElementById('funFooter')
    const backToTopBtn = document.getElementById('backToTop')
    let footerTimeout = null
    let isFooterVisible = false

    const checkScroll = () => {
      // Check if load more button exists
      const loadMoreBtn = document.querySelector('.load-more-btn')
      if (loadMoreBtn) {
        // Don't show footer if load more button is visible
        if (isFooterVisible) {
          footer.classList.remove('show')
          isFooterVisible = false
          clearTimeout(footerTimeout)
        }
        return
      }

      // Check if we have enough emojis loaded
      const emojiGrid = document.getElementById('emojiGrid')
      const emojiCards = emojiGrid.querySelectorAll('.emoji-card')

      // Only show footer if we have at least 20 emojis AND no load more button
      if (emojiCards.length < 20) {
        return
      }

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const emojiGridBottom = emojiGrid.getBoundingClientRect().bottom

      // Check if user is at the bottom of the emoji grid (not document)
      const isAtEmojiBottom = emojiGridBottom <= windowHeight + 50

      if (isAtEmojiBottom && !isFooterVisible) {
        // Show footer
        isFooterVisible = true
        footer.classList.add('show')

        // Only auto-hide if user scrolls away, not based on time
        clearTimeout(footerTimeout)
        footerTimeout = null
      } else if (!isAtEmojiBottom && isFooterVisible) {
        // Hide footer when scrolling up away from emoji grid
        footer.classList.remove('show')
        isFooterVisible = false
        clearTimeout(footerTimeout)
        footerTimeout = null
      }
    }

    // Check scroll position with debounce
    let scrollTimeout = null
    let lastFooterToggle = 0 // Prevent rapid toggling

    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout)

      // Add additional delay after footer operations
      const now = Date.now()
      const delaySinceLastToggle = now - lastFooterToggle
      const baseDelay = 50
      const additionalDelay = delaySinceLastToggle < 1000 ? 200 : 0

      scrollTimeout = setTimeout(() => {
        lastFooterToggle = Date.now()
        checkScroll()
      }, baseDelay + additionalDelay)
    }, { passive: true })

    // Also check after emojis are rendered
    const originalRenderEmojis = this.renderEmojis.bind(this)
    this.renderEmojis = () => {
      originalRenderEmojis()
      setTimeout(checkScroll, 100)
    }

    // Back to top button
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
      footer.classList.remove('show')
      isFooterVisible = false
      clearTimeout(footerTimeout)
    })

    // Hide footer when clicking outside (with delay)
    document.addEventListener('click', (e) => {
      if (isFooterVisible && !footer.contains(e.target)) {
        clearTimeout(footerTimeout)
        footerTimeout = setTimeout(() => {
          footer.classList.remove('show')
          isFooterVisible = false
        }, 300) // Small delay for better UX
      }
    })

    // Allow clicking footer to dismiss it
    footer.addEventListener('click', () => {
      if (isFooterVisible) {
        footer.classList.remove('show')
        isFooterVisible = false
        clearTimeout(footerTimeout)
      }
    })

    // Don't check on initial load - wait for user interaction
  }

  setupNavTabsScroll() {
    // Removed scroll indicators functionality
    // Keeping this function for future use if needed
  }
}

// Initialize the app
let emojiApp
document.addEventListener("DOMContentLoaded", () => {
  emojiApp = new EmojiEncyclopedia()
  window.emojiApp = emojiApp // Make it globally accessible
})
