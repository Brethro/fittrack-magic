import { FoodItem, FoodPrimaryCategory } from "@/types/diet";
import { categoryDisplayNames } from "@/utils/diet/foodDataProcessing";

// Function to get the human-readable display name for a category
export const getCategoryDisplayName = (category: FoodPrimaryCategory | string): string => {
  if (category in categoryDisplayNames) {
    return categoryDisplayNames[category as FoodPrimaryCategory];
  }
  return category;
};

// Function to assign default primary category based on food name with enhanced patterns
export const assignDefaultCategory = (food: FoodItem): FoodPrimaryCategory => {
  const name = food.name.toLowerCase();
  
  // Enhanced comprehensive regex patterns for better food categorization
  // Red Meat - expanded to include more specific cuts and preparations
  if (/beef|steak|lamb|pork|venison|bison|elk|moose|veal|goat|ribeye|sirloin|chuck|brisket|roast|jerky|ground meat|meatball|meatloaf|rabbit|hare|boar|game meat|filet mignon|flank|short rib|tenderloin|t-bone|porterhouse|prime rib|ham|bacon|prosciutto|salami|sausage|pastrami|corned beef/.test(name)) {
    return "redMeat";
  }
  
  // Poultry - expanded to include more types and preparations
  if (/chicken|turkey|duck|goose|quail|pheasant|ostrich|emu|hen|poultry|fowl|drumstick|thigh|breast|wing|nugget|tender|guinea fowl|partridge|squab|pigeon|cornish hen|ground turkey|ground chicken|chicken sausage|turkey bacon|poultry burger|chicken patty/.test(name)) {
    return "poultry";
  }
  
  // Fish - expanded to include more species and preparations
  if (/fish|salmon|tuna|cod|trout|tilapia|halibut|bass|mackerel|sardine|herring|anchov|eel|swordfish|snapper|haddock|grouper|catfish|flounder|pike|perch|mahi|sole|pollock|barramundi|carp|sturgeon|branzino|sea bass|monkfish|smoked salmon|lox|fish fillet|fish steak|fish cake|fish stick|fish ball|tuna salad|kipper/.test(name)) {
    return "fish";
  }
  
  // Seafood - expanded to include more types
  if (/shrimp|crab|lobster|scallop|clam|oyster|mussel|squid|octopus|seafood|prawn|crawfish|crayfish|mollusk|shellfish|calamari|caviar|roe|sea urchin|abalone|cockle|whelk|conch|langoustine|cuttlefish|sea cucumber|surimi|imitation crab/.test(name)) {
    return "seafood";
  }
  
  // Dairy - expanded to include more products and variations
  if (/milk|cheese|yogurt|cream|butter|dairy|whey|curd|kefir|ghee|cottage|cheddar|mozzarella|parmesan|ricotta|brie|feta|gouda|quark|mascarpone|camembert|buttermilk|casein|custard|ice cream|gelato|pudding|sour cream|cream cheese|half and half|skyr|fromage|fromage frais|crème fraîche|paneer|halloumi|burrata|string cheese|babybel/.test(name)) {
    return "dairy";
  }
  
  // Eggs - expanded to include more preparations
  if (/egg|yolk|white|omelette|frittata|quiche|deviled|scrambled|boiled|poached|egg salad|egg sandwich|egg roll|egg fu yung|egg drop|egg noodle|egg substitute|egg replacer|egg powder|meringue/.test(name)) {
    return "egg";
  }
  
  // Grains - expanded to include more types and preparations
  if (/rice|bread|wheat|pasta|cereal|oat|barley|rye|grain|flour|corn|tortilla|noodle|macaroni|spaghetti|penne|fettuccine|semolina|bulgur|couscous|quinoa|millet|amaranth|buckwheat|spelt|farro|bagel|bun|roll|loaf|cracker|biscuit|waffle|pancake|muffin|pizza|dough|croissant|pretzel|orzo|gnocchi|polenta|grits|risotto|soba|udon|ramen|vermicelli|lasagna|ravioli|tortellini|baguette|ciabatta|focaccia|pita|naan|chapati|roti|matzo|zwieback/.test(name)) {
    return "grain";
  }
  
  // Legumes - expanded to include more types and preparations
  if (/bean|lentil|pea|chickpea|soy|tofu|tempeh|legume|pulse|edamame|azuki|mung|fava|lima|pinto|navy|kidney|black bean|garbanzo|hummus|dal|refried bean|baked bean|bean sprout|bean curd|bean paste|bean soup|lentil soup|split pea|black-eyed pea|cannellini|borlotti|flageolet|adzuki|lupini|natto/.test(name)) {
    return "legume";
  }
  
  // Vegetables - split into more specific patterns for clarity
  if (/spinach|kale|arugula|lettuce|collard|chard|cabbage|watercress|endive|radicchio|microgreen|sprout|leaf green|mesclun|turnip green|dandelion green|beet green|mustard green/.test(name)) {
    return "vegetable";
  }
  
  if (/broccoli|cauliflower|brussels sprout|asparagus|celery|cucumber|zucchini|squash|eggplant|bell pepper|chili pepper|jalapeno|okra|artichoke|leek|fennel|kohlrabi|bamboo shoot/.test(name)) {
    return "vegetable";
  }
  
  if (/carrot|beet|radish|turnip|parsnip|rutabaga|daikon|ginger|turmeric|horseradish|jicama|cassava|sweet potato|yam|taro|potato|onion|garlic|shallot|scallion|chive/.test(name)) {
    return "vegetable";
  }
  
  if (/tomato|pepper|pumpkin|mushroom|truffle|sauerkraut|kimchi|pickle|olive|caper|avocado|corn|pea|green bean/.test(name)) {
    return "vegetable";
  }
  
  // Fruits - expanded to include more types
  if (/apple|orange|banana|grape|berry|melon|peach|pear|pineapple|cherry|fruit|strawberr|blueberr|raspberr|blackberr|cranberr|kiwi|mango|papaya|apricot|plum|fig|date|coconut|lemon|lime|grapefruit|watermelon|cantaloupe|honeydew|guava|lychee|pomegranate|persimmon|nectarine|tangerine|mandarin|clementine|passion fruit|dragon fruit|star fruit|jackfruit|plantain|durian|acai|goji|mulberry|elderberry|boysenberry|currant|raisin|prune|sultana/.test(name)) {
    return "fruit";
  }
  
  // Nuts - expanded to include more types and preparations
  if (/almond|walnut|pecan|cashew|pistachio|macadamia|peanut|nut|hazelnut|brazil nut|pine nut|chestnut|acorn|nut butter|almond butter|peanut butter|nut milk|almond milk|cashew milk|nut cheese|nut flour|nut meal|marcona|praline/.test(name)) {
    return "nut";
  }
  
  // Seeds - expanded to include more types and preparations
  if (/chia|flax|sesame|sunflower seed|pumpkin seed|hemp seed|seed|poppy|quinoa|amaranth|seed butter|tahini|seed milk|seed oil|seed flour|seed meal|seed cracker|seed bar/.test(name)) {
    return "seed";
  }
  
  // Oils - expanded to include more types
  if (/oil|olive oil|coconut oil|avocado oil|canola|vegetable oil|lard|shortening|margarine|sesame oil|peanut oil|safflower|sunflower oil|corn oil|palm oil|grapeseed|flaxseed oil|walnut oil|almond oil|hemp oil|fish oil|cod liver oil|ghee/.test(name)) {
    return "oil";
  }
  
  // Sweeteners - expanded to include more types
  if (/sugar|honey|syrup|sweetener|agave|stevia|molasses|nectar|saccharin|aspartame|sucralose|erythritol|xylitol|maltitol|jaggery|turbinado|demerara|confectioner|brown sugar|maple syrup|corn syrup|marmalade|jam|jelly|dessert|candy|chocolate|caramel|treacle|golden syrup|date syrup|coconut sugar|monk fruit|tagatose|allulose/.test(name)) {
    return "sweetener";
  }
  
  // Herbs - expanded to include more types
  if (/basil|oregano|thyme|rosemary|mint|parsley|cilantro|dill|herb|sage|bay leaf|tarragon|marjoram|chervil|fennel|lavender|lemongrass|savory|chive|melissa|verbena|borage|sorrel|lovage|hyssop|chervil|angelica|wintergreen|fenugreek leaf|curry leaf/.test(name)) {
    return "herb";
  }
  
  // Spices - expanded to include more types
  if (/pepper|salt|cinnamon|ginger|turmeric|cumin|paprika|nutmeg|spice|cardamom|clove|anise|allspice|coriander|cayenne|chili|vanilla|curry|saffron|fennel seed|caraway|juniper|mustard|horseradish|wasabi|seasoning|garlic powder|onion powder|black pepper|white pepper|pink pepper|szechuan pepper|sumac|five spice|za'atar|ras el hanout|garam masala|baharat|dukkah|berbere|pumpkin spice/.test(name)) {
    return "spice";
  }
  
  // Processed foods - expanded to include more types
  if (/candy|soda|processed|packaged|frozen|canned|microwave|snack|chip|crisp|dorito|cheeto|pretzel|popcorn|cracker|cookie|cake|pastry|muffin|donut|pie|cereal|granola bar|energy bar|pudding|gelatin|jello|ice cream|sherbet|sorbet|frosting|icing|ready meal|instant|convenience|fast food|takeout|takeaway|frozen dinner|tv dinner|cup noodle|instant soup|microwave meal|processed meat|lunch meat|spam|canned soup|boxed mix|cake mix/.test(name)) {
    return "processedFood";
  }
  
  // Default fallback
  return "other";
};

// New function for categorizing ambiguous cases
export const resolveAmbiguousCategory = (food: FoodItem): FoodPrimaryCategory => {
  const name = food.name.toLowerCase();
  
  // Handle compound foods like "turkey bacon" (poultry primary, processedFood secondary)
  if (/turkey bacon|chicken sausage|plant-based burger|vegan cheese|almond milk|coconut cream/.test(name)) {
    // Extract the main ingredient
    if (name.includes("turkey") || name.includes("chicken")) return "poultry";
    if (name.includes("plant-based") || name.includes("vegan")) return "legume";
    if (name.includes("almond")) return "nut";
    if (name.includes("coconut")) return "fruit";
    // Otherwise fall back to processed
    return "processedFood";
  }
  
  // Handle regional food variations
  if (name.includes("aubergine")) return "vegetable"; // eggplant
  if (name.includes("courgette")) return "vegetable"; // zucchini
  if (name.includes("rocket")) return "vegetable"; // arugula
  
  // Fall back to other for truly ambiguous cases
  return "other";
};

// Helper function to infer secondary categories with improved patterns
export const inferSecondaryCategories = (food: FoodItem): FoodPrimaryCategory[] => {
  const name = food.name.toLowerCase();
  const secondaryCategories: FoodPrimaryCategory[] = [];
  const primaryCategory = food.primaryCategory;
  
  // Add meat as a secondary category if the primary is a type of meat
  if (primaryCategory === "redMeat" || primaryCategory === "poultry" || 
      primaryCategory === "fish" || primaryCategory === "seafood") {
    secondaryCategories.push("meat");
  }
  
  // Add secondary categories based on keywords
  if (/processed|packaged|frozen|canned|microwave|instant|ready-to-eat|pre-prepared|convenience|dried|preserved|fermented|smoked|cured/.test(name)) {
    secondaryCategories.push("processedFood");
  }
  
  // Food preparation and forms
  if (/sauce|dressing|condiment|marinade|glaze|spread|dip|gravy|stock|broth|paste|extract|concentrate|reduction|roux|seasoning blend|spice mix/.test(name)) {
    if (!secondaryCategories.includes("processedFood")) {
      secondaryCategories.push("processedFood");
    }
  }
  
  // Nutritional supplements
  if (/supplement|vitamin|mineral|protein powder|creatine|amino acid|bcaa|collagen|pre-workout|post-workout|weight gainer|meal replacement|electrolyte|enzyme|probiotic|fiber supplement/.test(name)) {
    secondaryCategories.push("other");
  }
  
  // Beverages
  if (/beverage|drink|juice|smoothie|tea|coffee|water|milk|alcohol|beer|wine|spirit|cocktail|soda|pop|fizzy drink|energy drink|sports drink|kombucha|kefir|shake|latte|espresso|cappuccino|macchiato|mocha|lemonade|cola/.test(name)) {
    secondaryCategories.push("other");
  }
  
  // Regional cuisines that might indicate specific categories
  if (/indian|chinese|japanese|thai|mexican|italian|mediterranean|middle eastern|french|spanish|greek|korean|vietnamese|german|cajun|creole/.test(name)) {
    // If it's a prepared dish, likely processed
    if (!/oil|spice|herb|fresh|raw|seed|nut|fruit|vegetable/.test(name)) {
      if (!secondaryCategories.includes("processedFood")) {
        secondaryCategories.push("processedFood");
      }
    }
  }
  
  return secondaryCategories.length > 0 ? secondaryCategories : undefined;
};
