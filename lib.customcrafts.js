(function LibCustomCrafts() {
    ModAPI.meta.title("LibCustomCrafts");
    ModAPI.meta.credits("By ZXMushroom63");
    ModAPI.meta.icon("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAtFBMVEVHcEwYEwxMPSYcFw4tIxVbSS0VEQpNOiN4Ty8aFAxVRCpeTC9dPiVjUDE0KhoxKBgSDgkWEgsYFAxlUzMhGQ9PPydPPiYjGxAwJxlANCB1XDh6Yz5BNCBbSi1PQCc8Lx1lUDFfTC1+UTF3Ty9vRil9UzIrIhU3KxpWRixTQylKOiN3TC2GVjNdSCxuWjc+Mx92YDppW0ZUSjpENSBrVjSIbUN+Z0B9ZD5eNSCBaUFcPyaHeWIo38CYAAAAHnRSTlMABvA9QvI9p/AHSO+nqL6hHD4c8Uy+vkzx8fLv76GQSIt6AAAAy0lEQVQY0z2P13LCMBREhcGxMTUEEgiJepe7DYTw//+FRNu5L3tmZ/YuAEHj9ebzawyeGoymKWPpdDR42CSlueM0T5OAVouYMeeY41yIeLEEwwnhuaCcUZr/m+jdg7r4c4IKwVVHojcwjAlGBBfGdtKaACakR+VZVxpKi2+g0RUuobL+dAAfl0bhg1EdkvCeODWorCFqW6nhT0icelUfTNW0Eha+dvX7fazKHiKiZREnS/96Ntsda+urt8lrzWxvUPS0t/nZfJ7d518BlfsYCbFp6bEAAAAASUVORK5CYII=");
    ModAPI.meta.description("Library to register custom crafting recipes");

    function LCC_registerRecipe(data) {
        globalThis.LCI_REGISTRY ||= [];
        globalThis.LCI_RECIPEEVENTS ||= {};
        globalThis.LCI_ITEMDB ||= {};

        // Register craftingExtra if provided
        if (data.craftingExtra) {
            globalThis.LCI_RECIPEEVENTS[data.tag || data.name] = new Function("itemstack", data.craftingExtra);
        }

        // Convert recipe legend to ingredients
        var recipeInternal = [];
        Object.keys(data.recipeLegend).forEach((key) => {
            recipeInternal.push(ToChar(key));
            var ingredient = null;
            var schema = data.recipeLegend[key];
            if (schema.type === "block") {
                ingredient = ModAPI.blocks[schema.id].getRef();
            } else {
                ingredient = ModAPI.items[schema.id].getRef();
            }
            recipeInternal.push(ingredient);
        });

        // Convert recipe shape to array of strings
        var recipeContents = data.recipe.flatMap(x => { return ModAPI.util.str(x) });
        var recipe = ModAPI.util.makeArray(ObjectClass, recipeContents.concat(recipeInternal));

        // Create the output ItemStack for the custom item
        var testItem = ModAPI.reflect.getClassById("net.minecraft.item.ItemStack").constructors[4](ModAPI.items[data.base].getRef(), data.qty || 1);
        testItem.$stackTagCompound = ModAPI.reflect.getClassById("net.minecraft.nbt.NBTTagCompound").constructors[0]();
        testItem.$stackTagCompound.$setTag(ModAPI.util.str("display"), ModAPI.reflect.getClassById("net.minecraft.nbt.NBTTagCompound").constructors[0]());
        var displayTag = testItem.$stackTagCompound.$getCompoundTag(ModAPI.util.str("display"));
        displayTag.$setString(ModAPI.util.str("Name"), ModAPI.util.str(data.name));

        // Apply craftingExtra effects if provided
        if (globalThis.LCI_RECIPEEVENTS[data.tag || data.name]) {
            globalThis.LCI_RECIPEEVENTS[data.tag || data.name](new Proxy(testItem, ModAPI.util.TeaVM_to_Recursive_BaseData_ProxyConf));
        }

        // Register item in global item database
        globalThis.LCI_ITEMDB[data.tag || data.name] = new Proxy(testItem, ModAPI.util.TeaVM_to_Recursive_BaseData_ProxyConf);

        // Register the recipe with the crafting manager
        var craftingManager = ModAPI.reflect.getClassById("net.minecraft.item.crafting.CraftingManager").staticMethods.getInstance.method();
        if ((data.useRecipe !== false) || (data.useRecipe !== "false")) {
            ModAPI.hooks.methods.nmic_CraftingManager_addRecipe(craftingManager, testItem, recipe);
        }
    }

    // Add server-side code to register recipes on startup
    ModAPI.dedicatedServer.appendCode(`(function () {
        function serverTickHandler() {
            LCI_registerItem(${JSON.stringify(data)});
            ModAPI.removeEventListener("tick", serverTickHandler);
        }
        ModAPI.addEventListener("tick", serverTickHandler);
    })()`);

    // Expose the register function to other scripts
    window.LibCustomCrafting = {};
    LibCustomCrafting.registerRecipe = function register(data) {
        LCC_registerItem(data);
    };

})();
