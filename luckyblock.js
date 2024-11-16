(()=>{
    ModAPI.meta.title("Lucky Blocks");
    ModAPI.meta.credits("By radmanplays(with some code used from the unluckyblock mod by ZXMushroom63)");
    ModAPI.meta.icon("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAA1VBMVEXupRfunxT35l312kv24kv252rmhin10Tj1xTr352L0zjX35ljyqhv21D3smxT24EP341r1ohb2sBflfxb0vCbqmRP1zyzrkxL23Tvywi/331D9883978T86tb0lw7qeQ/woxT10TP22DP1xCbtohf22jX46nrpkjH1yS/0zDv10kj+9dn86NX12lX2kA/121/wmyX515D0syL3yY322ULnixLbchrokCj647/0zVT98cjlgxnplUT75sH42b31iRH1jSf02kT53MDXaRDojEPojUL417tO1HZdAAAA5UlEQVQY0x3KxWLDMBBF0ZEsy8xMMdUQxw2jQ+X//6SqncUszrvweTw6Bw/pQYBAtbcBnHZuNBcEQWZPFjdr0EXNxIqimLERVqXowQuHpXa6n++pGTaNj/4AJ9kXvY3TUFX/QLjFSKNhMXZCWCKAdyNOH1SWmAqhrwNwxBhO10ua/VC5qT0GihH38zT7ptfedwMGmBBiTg8qslZmxSsvSVjib5RTyL4+AKx4dm1yvsT73lUdVphsb5OPLqpta5YDiBpRMF51ztZWLSsHdSOWmibIkcv29c6BQi0KhJCuo9ly+XzLfwEFKBgMUhzHUAAAAABJRU5ErkJggg==");
    ModAPI.meta.description("eaglerforge luckyblock mod.  Requires AsyncSink.");

    function luckyBlocks() {
        function fixupBlockIds() {
            var blockRegistry = ModAPI.util.wrap(ModAPI.reflect.getClassById("net.minecraft.block.Block").staticVariables.blockRegistry).getCorrective();
            var BLOCK_STATE_IDS = ModAPI.util.wrap(ModAPI.reflect.getClassById("net.minecraft.block.Block").staticVariables.BLOCK_STATE_IDS).getCorrective();
            blockRegistry.registryObjects.hashTableKToV.forEach(entry => {
                if (entry) {
                    var block = entry.value;
                    var validStates = block.getBlockState().getValidStates();
                    var stateArray = validStates.array || [validStates.element];
                    stateArray.forEach(iblockstate => {
                        var i = blockRegistry.getIDForObject(block.getRef()) << 4 | block.getMetaFromState(iblockstate.getRef());
                        BLOCK_STATE_IDS.put(iblockstate.getRef(), i);
                    });
                }
            });
        }
        
        async function spawnListOfEntities(entities, world) {
            var spawn = ModAPI.promisify(ModAPI.hooks.methods.nmw_World_spawnEntityInWorld);
            for (let i=0; i<entities.length; i++) {
              await spawn(world, entities[i]);
            }
          }
        var itemClass = ModAPI.reflect.getClassById("net.minecraft.item.Item");
        var blockClass = ModAPI.reflect.getClassById("net.minecraft.block.Block");
        var iproperty = ModAPI.reflect.getClassById("net.minecraft.block.properties.IProperty").class;
        var makeBlockState = ModAPI.reflect.getClassById("net.minecraft.block.state.BlockState").constructors.find(x => x.length === 2);
        var blockSuper = ModAPI.reflect.getSuper(blockClass, (x) => x.length === 2); //Get super function from the block class with a target length of two. ($this (mandatory), material (optional))
        var creativeBlockTab = ModAPI.reflect.getClassById("net.minecraft.creativetab.CreativeTabs").staticVariables.tabBlock;
        var breakBlockMethod = blockClass.methods.breakBlock.method;
        var isplayercreative = false;
        var nmb_Blocklucky = function nmb_Blocklucky() {
            blockSuper(this, ModAPI.materials.rock.getRef()); //Use super function to get block properties on this class.
            this.$defaultBlockState = this.$blockState.$getBaseState();
            this.$setCreativeTab(creativeBlockTab);
        }
        ModAPI.reflect.prototypeStack(blockClass, nmb_Blocklucky);
        nmb_Blocklucky.prototype.$isOpaqueCube = function () {
            return 1;
        }
        nmb_Blocklucky.prototype.$createBlockState = function () {
            return makeBlockState(this, ModAPI.array.object(iproperty, 0));
        }
        //called after the block is broken
        nmb_Blocklucky.prototype.$breakBlock = function ($world, $blockpos, $blockstate) {
            var world = ModAPI.util.wrap($world);
            var blockpos = ModAPI.util.wrap($blockpos);
            const randomChance = Math.random();
            if(!isplayercreative){
                if (randomChance < 0.20) {
                    // 20% chance: Spawn 3 items of two random ores (Diamond, Emerald, Gold, or Iron)
                    
                    // Randomly select two ores
                    const ores = ['diamond', 'emerald', 'gold_ingot', 'iron_ingot'];
                    const selectedOres = [];
                    
                    // Randomly pick two different ores
                    while (selectedOres.length < 2) {
                        const ore = ores[Math.floor(Math.random() * ores.length)];
                        if (!selectedOres.includes(ore)) {
                            selectedOres.push(ore);
                        }
                    }
                    
                    // Create item stacks for the selected ores
                    const itemStack = ModAPI.reflect.getClassByName("ItemStack");
                    const firstOre = selectedOres[0];
                    const secondOre = selectedOres[1];
                    
                    const firstOreStack = itemStack.constructors[4](ModAPI.items[firstOre].getRef(), 3);
                    const secondOreStack = itemStack.constructors[4](ModAPI.items[secondOre].getRef(), 3);
                    
                    // Create item entities for the ores
                    const EntityItem = ModAPI.reflect.getClassByName("EntityItem");
                    const firstItem = EntityItem.constructors[1](world.getRef(), blockpos.x, blockpos.y, blockpos.z, firstOreStack);
                    const secondItem = EntityItem.constructors[1](world.getRef(), blockpos.x, blockpos.y, blockpos.z, secondOreStack);
                    spawnListOfEntities([firstItem, secondItem], world.getRef());
                    
                } else if (randomChance < 0.40) {
                    // 20% chance: Spawn gold tools
                    const itemStack = ModAPI.reflect.getClassByName("ItemStack");
                    const EntityItem = ModAPI.reflect.getClassByName("EntityItem");
                    const goldswordStack = itemStack.constructors[4](ModAPI.items["golden_sword"].getRef(), 1);
                    const goldsword = EntityItem.constructors[1](world.getRef(), blockpos.x, blockpos.y, blockpos.z, goldswordStack);
                    const goldpickaxeStack = itemStack.constructors[4](ModAPI.items["golden_pickaxe"].getRef(), 1);
                    const goldpickaxe = EntityItem.constructors[1](world.getRef(), blockpos.x, blockpos.y, blockpos.z, goldpickaxeStack);
                    const goldaxeStack = itemStack.constructors[4](ModAPI.items["golden_axe"].getRef(), 1);
                    const goldaxe = EntityItem.constructors[1](world.getRef(), blockpos.x, blockpos.y, blockpos.z, goldaxeStack);
                    spawnListOfEntities([goldsword, goldpickaxe, goldaxe], world.getRef());
                } else if (randomChance < 0.60) {
                    // 20% chance: Spawn 50 experience orbs
                    for (let i = 0; i < 50; i++) {
                        const EntityXP = ModAPI.reflect.getClassByName("EntityXPOrb");
                        const xporb = EntityXP.constructors[0](world.getRef(), blockpos.x, blockpos.y, blockpos.z, 1); // Create XP orb with 1 experience value
                        spawnListOfEntities([xporb], world.getRef());
                    }
                } else if (randomChance < 0.80) {
                    // 20% chance: Trigger a TNT explosion with a 4-block blast radius
                    world.newExplosion(null, blockpos.getX() + 0.5, blockpos.getY() + 0.5, blockpos.getZ() + 0.5, 2, true, true);
                } else if (randomChance < 1.00) {
                    // 20% chance: Rotten flesh
                    const itemStack = ModAPI.reflect.getClassByName("ItemStack");
                    const EntityItem = ModAPI.reflect.getClassByName("EntityItem");
                    const rottenfleshStack = itemStack.constructors[4](ModAPI.items["rotten_flesh"].getRef(), 1);
                    const rottenflesh = EntityItem.constructors[1](world.getRef(), blockpos.x, blockpos.y, blockpos.z, rottenfleshStack);
                    spawnListOfEntities([rottenflesh], world.getRef());
                }
                
            }
            
            return breakBlockMethod(this, $world, $blockpos, $blockstate);
        }
        //called before the block is broken
        nmb_Blocklucky.prototype.$onBlockHarvested = function ($world, $blockpos, $blockstate, $player) {
            var world = ModAPI.util.wrap($world);
            var blockpos = ModAPI.util.wrap($blockpos);
            var player = ModAPI.util.wrap($player);
            if(player.capabilities.isCreativeMode){
                isplayercreative = true;
            }else{
                isplayercreative = false
            }

        }

        function internal_reg() {
            var block_of_luck = (new nmb_Blocklucky()).$setHardness(0.3).$setStepSound(blockClass.staticVariables.soundTypePiston).$setUnlocalizedName(
                ModAPI.util.str("lucky_block")
            );
            blockClass.staticMethods.registerBlock0.method(
                545,  //use blockid 545. MAKE SURE TO CHANGE IF YOU ARE MAKING A MOD USING THIS, MAXIMUM BLOCK ID IS 4095.
                ModAPI.util.str("lucky_block"),
                block_of_luck
            );
            itemClass.staticMethods.registerItemBlock0.method(block_of_luck);
            fixupBlockIds();
            ModAPI.blocks["lucky_block"] = block_of_luck;
            
            return block_of_luck;
        }


        if (ModAPI.materials) {
            return internal_reg();
        } else {
            ModAPI.addEventListener("bootstrap", internal_reg);
        }
    }
    ModAPI.dedicatedServer.appendCode(luckyBlocks);
    var block_of_luck = luckyBlocks();
    ModAPI.addEventListener("lib:asyncsink", async () => {
        ModAPI.addEventListener("custom:asyncsink_reloaded", ()=>{
            ModAPI.mc.renderItem.registerBlock(block_of_luck, ModAPI.util.str("lucky_block"));
        });
        AsyncSink.L10N.set("tile.lucky_block.name", "Lucky Block");
        AsyncSink.setFile("resourcepacks/AsyncSinkLib/assets/minecraft/models/block/lucky_block.json", JSON.stringify(
            {
                "parent": "block/cube_all",
                "textures": {
                    "all": "blocks/lucky_block"
                }
            }
        ));
        AsyncSink.setFile("resourcepacks/AsyncSinkLib/assets/minecraft/models/item/lucky_block.json", JSON.stringify(
            {
                "parent": "block/lucky_block",
                "display": {
                    "thirdperson": {
                        "rotation": [10, -45, 170],
                        "translation": [0, 1.5, -2.75],
                        "scale": [0.375, 0.375, 0.375]
                    }
                }
            }
        ));
        AsyncSink.setFile("resourcepacks/AsyncSinkLib/assets/minecraft/blockstates/lucky_block.json", JSON.stringify(
            {
                "variants": {
                    "normal": [
                        { "model": "lucky_block" },
                    ]
                }
            }
        ));
        AsyncSink.setFile("resourcepacks/AsyncSinkLib/assets/minecraft/textures/blocks/lucky_block.png", await (await fetch(
            "data:image/png;base64,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"
        )).arrayBuffer());
    });



    async function addluckyblockRecipe() {
        await new Promise((res,rej)=>{var x = setInterval(()=>{if(ModAPI.blocks){clearInterval(x);res();}}, 100);})
        var ObjectClass = ModAPI.reflect.getClassById("java.lang.Object").class;
        function ToChar(char) {
            return ModAPI.reflect.getClassById("java.lang.Character").staticMethods.valueOf.method(char[0].charCodeAt(0));
        }

        // Define the recipe legend to map characters to items
        var recipeLegend = {
            "D": {
                type: "block",
                id: "dropper"
            },
            "G": {
                type: "item",
                id: "gold_ingot"
            }
        };

        // Define the crafting grid pattern for the recipe
        var recipePattern = [
            "GGG",
            "GDG",
            "GGG"
        ];

        var recipeInternal = [];
        Object.keys(recipeLegend).forEach((key) => {
            recipeInternal.push(ToChar(key));
            var ingredient;
            if (recipeLegend[key].type === "item") {
                // Handle item (gold ingot)
                ingredient = ModAPI.items[recipeLegend[key].id].getRef(); // Use ModAPI.items for items
            } else if (recipeLegend[key].type === "block") {
                // Handle block (dropper)
                ingredient = ModAPI.blocks[recipeLegend[key].id].getRef();
            }
            recipeInternal.push(ingredient);
        });

        var recipeContents = recipePattern.flatMap(row => ModAPI.util.str(row));
        var recipe = ModAPI.util.makeArray(ObjectClass, recipeContents.concat(recipeInternal));

        // Define the output item as diamond_block
        var resultItem = ModAPI.reflect.getClassById("net.minecraft.item.ItemStack").constructors[1](ModAPI.blocks["lucky_block"].getRef(), 1);



        // Register the recipe with CraftingManager
        var craftingManager = ModAPI.reflect.getClassById("net.minecraft.item.crafting.CraftingManager").staticMethods.getInstance.method();
        ModAPI.hooks.methods.nmic_CraftingManager_addRecipe(craftingManager, resultItem, recipe);
    }

    ModAPI.dedicatedServer.appendCode(addluckyblockRecipe);

    addluckyblockRecipe();
})();
