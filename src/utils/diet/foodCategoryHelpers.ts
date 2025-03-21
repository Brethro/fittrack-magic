
import { FoodItem, FoodPrimaryCategory } from "@/types/diet";

// Function to assign default primary category based on food name (migration helper)
export const assignDefaultCategory = (food: FoodItem): FoodPrimaryCategory => {
  const name = food.name.toLowerCase();
  
  // Enhanced comprehensive regex patterns for better food categorization
  if (/beef|steak|lamb|pork|venison|bison|elk|moose|veal|goat|ribeye|sirloin|chuck|brisket|roast|jerky|ground meat|meatball|meatloaf|rabbit|hare|boar|game meat/.test(name)) return "redMeat";
  
  if (/chicken|turkey|duck|goose|quail|pheasant|ostrich|emu|hen|poultry|fowl|drumstick|thigh|breast|wing|nugget|tender|guinea fowl|partridge|squab|pigeon/.test(name)) return "poultry";
  
  if (/fish|salmon|tuna|cod|trout|tilapia|halibut|bass|mackerel|sardine|herring|anchov|eel|swordfish|snapper|haddock|grouper|catfish|flounder|pike|perch|mahi|sole|pollock|barramundi|carp|sturgeon/.test(name)) return "fish";
  
  if (/shrimp|crab|lobster|scallop|clam|oyster|mussel|squid|octopus|seafood|prawn|crawfish|crayfish|mollusk|shellfish|calamari/.test(name)) return "seafood";
  
  if (/milk|cheese|yogurt|cream|butter|dairy|whey|curd|kefir|ghee|cottage|cheddar|mozzarella|parmesan|ricotta|brie|feta|gouda|quark|mascarpone|camembert|buttermilk|casein/.test(name)) return "dairy";
  
  if (/egg|yolk|white|omelette|frittata|quiche|deviled|scrambled|boiled|poached/.test(name)) return "egg";
  
  if (/rice|bread|wheat|pasta|cereal|oat|barley|rye|grain|flour|corn|tortilla|noodle|macaroni|spaghetti|penne|fettuccine|semolina|bulgur|couscous|quinoa|millet|amaranth|buckwheat|spelt|farro|bagel|bun|roll|loaf|cracker|biscuit|waffle|pancake|muffin|pizza|dough/.test(name)) return "grain";
  
  if (/bean|lentil|pea|chickpea|soy|tofu|tempeh|legume|pulse|edamame|azuki|mung|fava|lima|pinto|navy|kidney|black bean|garbanzo/.test(name)) return "legume";
  
  if (/spinach|broccoli|carrot|lettuce|tomato|potato|onion|garlic|kale|cabbage|vegetable|veggie|celer|cucumber|pepper|eggplant|zucchini|squash|pumpkin|cauliflower|asparagus|artichoke|leek|radish|turnip|beet|rutabaga|scallion|chive|shallot|okra|chard|collard|turnip|parsnip|mushroom|truffle|arugula|watercress|endive|radicchio/.test(name)) return "vegetable";
  
  if (/apple|orange|banana|grape|berry|melon|peach|pear|pineapple|cherry|fruit|strawberr|blueberr|raspberr|blackberr|cranberr|kiwi|mango|papaya|apricot|plum|fig|date|coconut|lemon|lime|grapefruit|watermelon|cantaloupe|honeydew|guava|lychee|pomegranate|persimmon|nectarine|tangerine|mandarin|clementine|passion fruit|dragon fruit|star fruit|jackfruit|plantain|durian|avocado/.test(name)) return "fruit";
  
  if (/almond|walnut|pecan|cashew|pistachio|macadamia|peanut|nut|hazelnut|brazil nut|pine nut|chestnut|acorn|nut butter|almond butter|peanut butter/.test(name)) return "nut";
  
  if (/chia|flax|sesame|sunflower|pumpkin seed|hemp seed|seed|poppy|quinoa/.test(name)) return "seed";
  
  if (/oil|olive|coconut oil|avocado oil|canola|vegetable oil|lard|shortening|margarine|sesame oil|peanut oil|safflower|sunflower oil|corn oil|palm oil|grapeseed/.test(name)) return "oil";
  
  if (/sugar|honey|syrup|sweetener|agave|stevia|molasses|nectar|saccharin|aspartame|sucralose|erythritol|xylitol|maltitol|jaggery|turbinado|demerara|confectioner|brown sugar|maple syrup|corn syrup|marmalade|jam|jelly|dessert|candy|chocolate|caramel/.test(name)) return "sweetener";
  
  if (/basil|oregano|thyme|rosemary|mint|parsley|cilantro|dill|herb|sage|bay leaf|tarragon|marjoram|chervil|fennel|lavender|lemongrass|savory|chive|melissa|verbena/.test(name)) return "herb";
  
  if (/pepper|salt|cinnamon|ginger|turmeric|cumin|paprika|nutmeg|spice|cardamom|clove|anise|allspice|coriander|cayenne|chili|vanilla|curry|saffron|fennel seed|caraway|juniper|mustard|horseradish|wasabi|seasoning|garlic powder|onion powder/.test(name)) return "spice";
  
  if (/candy|soda|processed|packaged|frozen|canned|microwave|snack|chip|crisp|dorito|cheeto|pretzel|popcorn|cracker|cookie|cake|pastry|muffin|donut|pie|cereal|granola bar|energy bar|pudding|gelatin|jello|ice cream|sherbet|sorbet|frosting|icing/.test(name)) return "processedFood";
  
  return "other";
};

// Helper function to infer secondary categories (migration helper)
export const inferSecondaryCategories = (food: FoodItem): FoodPrimaryCategory[] => {
  const name = food.name.toLowerCase();
  const secondaryCategories: FoodPrimaryCategory[] = [];
  
  // Add secondary categories based on keywords
  if (/processed|packaged|frozen|canned|microwave|instant|ready-to-eat|pre-prepared|convenience/.test(name)) {
    secondaryCategories.push("processedFood");
  }
  
  // More rules for secondary categories
  if (/sauce|dressing|condiment|marinade|glaze|spread|dip/.test(name)) {
    secondaryCategories.push("other");
  }
  
  if (/supplement|vitamin|mineral|protein powder|creatine|amino acid|bcaa|collagen/.test(name)) {
    secondaryCategories.push("other");
  }
  
  if (/beverage|drink|juice|smoothie|tea|coffee|water|milk|alcohol|beer|wine|spirit|cocktail/.test(name)) {
    secondaryCategories.push("other");
  }
  
  return secondaryCategories.length > 0 ? secondaryCategories : undefined;
};
