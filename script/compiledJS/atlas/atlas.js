"use strict";
class Atlas {
    tileSize;
    texturesPerRow;
    tiles;
    props;
    objects;
    sprites;
    dynamicSprites;
    itemSprites;
    tileCtx;
    propCtx;
    objectCtx;
    spriteCtx;
    dynamicSpriteCtx;
    itemSpriteCtx;
    constructor(tileSize, texturesPerRow) {
        this.tileSize = tileSize;
        this.texturesPerRow = texturesPerRow;
        const spriteSize = this.getSpriteSize();
        this.tiles = new OffscreenCanvas(spriteSize * this.texturesPerRow, spriteSize * Math.ceil(tiles.length / this.texturesPerRow));
        this.props = new OffscreenCanvas(spriteSize * this.texturesPerRow, spriteSize * Math.ceil(props.length / this.texturesPerRow));
        this.objects = new OffscreenCanvas(spriteSize * this.texturesPerRow, spriteSize * Math.ceil(dynamicObjects.length / this.texturesPerRow));
        this.sprites = new OffscreenCanvas(spriteSize * this.texturesPerRow, spriteSize * Math.ceil(13 / this.texturesPerRow));
        // Dynamic sprites should realistically only ever take 4 slots due to there being at most 4 custom characters.
        this.dynamicSprites = new OffscreenCanvas(spriteSize * this.texturesPerRow, 2 * spriteSize);
        this.itemSprites = new OffscreenCanvas(spriteSize * this.texturesPerRow, spriteSize * Math.ceil(itemManager.getAllItems().length / this.texturesPerRow));
        this.tileCtx = this.tiles.getContext("2d");
        this.propCtx = this.props.getContext("2d");
        this.objectCtx = this.objects.getContext("2d");
        this.spriteCtx = this.sprites.getContext("2d");
        this.dynamicSpriteCtx = this.dynamicSprites.getContext("2d");
        this.itemSpriteCtx = this.itemSprites.getContext("2d");
        console.log(`Atlas initialized with tileSize: ${tileSize}, texturesPerRow: ${texturesPerRow}, spriteSize: ${spriteSize}`);
        console.log(`Tiles canvas size: ${this.tiles.width}x${this.tiles.height}`);
        this.loadTextures();
    }
    getTileSize() {
        return this.tileSize;
    }
    // This applies to every image within each atlas, because the baseline for textures is 240x240px.
    getSpriteSize() {
        return Math.round(this.tileSize * 2.5);
    }
    getTexturesPerRow() {
        return this.texturesPerRow;
    }
    getTileAtlas() {
        return this.tiles;
    }
    getPropAtlas() {
        return this.props;
    }
    getObjectAtlas() {
        return this.objects;
    }
    getSpriteAtlas() {
        return this.sprites;
    }
    getDynamicSpriteAtlas() {
        return this.dynamicSprites;
    }
    loadTextures() {
        let loadTime = performance.now();
        this.tileCtx.fillStyle = "rgba(0, 0, 0, 0)"; // Transparent background
        this.spriteCtx.fillStyle = "rgba(0, 0, 0, 0)"; // Transparent background
        this.tileCtx.fillRect(0, 0, this.tiles.width, this.tiles.height);
        this.spriteCtx.fillRect(0, 0, this.sprites.width, this.sprites.height);
        // Load tile textures into the tile atlas
        for (let i = 0; i < tiles.length; i++) {
            const tile = tiles[i];
            const img = new Image();
            img.onload = () => {
                const x = (i % this.texturesPerRow) * this.getSpriteSize();
                const y = Math.floor(i / this.texturesPerRow) * this.getSpriteSize();
                this.tileCtx.drawImage(img, x, y, this.getSpriteSize(), this.getSpriteSize());
                tiles[i].setTexturePosition(x, y);
                console.log(`Loaded tile texture: ${tile.getTexturePath()} at (${x}, ${y})`);
            };
            img.onerror = () => {
                console.error(`Failed to load tile texture: ${tile.getTexturePath()}`);
            };
            img.src = tile.getTexturePath();
        }
        // Load prop textures into the prop atlas
        // Skip the first prop since it's the default "empty" prop with no texture
        for (let i = 0; i < props.length; i++) {
            if (i === 0)
                continue; // Skip the default empty prop
            const prop = props[i];
            const img = new Image();
            img.onload = () => {
                const x = (i % this.texturesPerRow) * this.getSpriteSize();
                const y = Math.floor(i / this.texturesPerRow) * this.getSpriteSize();
                this.propCtx.drawImage(img, x, y, this.getSpriteSize(), this.getSpriteSize());
                props[i].setTexturePosition(x, y);
                console.log(`Loaded prop texture: ${prop.getTexturePath()} at (${x}, ${y})`);
            };
            img.onerror = () => {
                console.error(`Failed to load prop texture: ${prop.getTexturePath()}`);
            };
            img.src = prop.getTexturePath();
        }
        // Load dynamic object textures into the object atlas
        // Dynamic objects can have various texture sizes and so need to be handled differently.
        for (let i = 0; i < dynamicObjects.length; i++) {
            const object = dynamicObjects[i];
            for (let stateIndex = 0; stateIndex < object.getStateTextures().length; stateIndex++) {
                const index = i * object.getStateTextures().length + stateIndex;
                const img = new Image();
                img.onload = () => {
                    const x = (index % this.texturesPerRow) * this.getSpriteSize();
                    const y = Math.floor(index / this.texturesPerRow) * this.getSpriteSize();
                    this.objectCtx.drawImage(img, x, y, this.getSpriteSize(), this.getSpriteSize());
                    dynamicObjects[i].setStateTexturePosition(stateIndex, x, y);
                    console.log(`Loaded dynamic object texture: ${object.getStateTextures()[stateIndex]} at (${x}, ${y})`);
                };
                img.onerror = () => {
                    console.error(`Failed to load dynamic object texture: ${object.getStateTextures()[stateIndex]}`);
                };
                img.src = object.getStateTextures()[stateIndex];
            }
        }
        const enemies = entityManager.getEnemyTemplates();
        // load enemy sprites
        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            const img = new Image();
            img.onload = () => {
                const x = (i % this.texturesPerRow) * this.getSpriteSize();
                const y = Math.floor(i / this.texturesPerRow) * this.getSpriteSize();
                this.spriteCtx.drawImage(img, x, y, this.getSpriteSize(), this.getSpriteSize());
                entityManager.getEnemyTemplateById(enemy.id)?.setSpritePosition(x, y);
            };
            img.onerror = () => {
                console.error(`Failed to load enemy sprite: ${enemy.getSpritePath()}`);
            };
            console.log(`Loading enemy sprite: ${enemy.getSpritePath()}`);
            img.src = enemy.getSpritePath();
        }
        // Load item sprites into the item atlas
        const items = itemManager.getAllItems();
        let j = 0;
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            if (item instanceof Armor) {
                const equippableData = item.getEquippableItemData();
                equippableData.forEach((data, index) => {
                    console.log(index, data);
                    const img = new Image();
                    img.onload = () => {
                        const x = (j % this.texturesPerRow) * this.getSpriteSize();
                        const y = Math.floor(j / this.texturesPerRow) * this.getSpriteSize();
                        console.log(`Loaded armor item sprite: ${data.texturePath} at (${x}, ${y})`);
                        this.itemSpriteCtx.drawImage(img, x, y, this.getSpriteSize(), this.getSpriteSize());
                        // @ts-ignore - The above code has already verified that this item is of the Armor class.
                        itemManager.getItem(item.getId())?.setItemTexturePosition(index, x, y);
                        j++;
                    };
                    img.onerror = () => {
                        console.error(`Failed to load armor item sprite: ${data.texturePath}`);
                    };
                    img.src = data.texturePath;
                });
            }
            else {
                const img = new Image();
                img.onload = () => {
                    const x = (j % this.texturesPerRow) * this.getSpriteSize();
                    const y = Math.floor(j / this.texturesPerRow) * this.getSpriteSize();
                    this.itemSpriteCtx.drawImage(img, x, y, this.getSpriteSize(), this.getSpriteSize());
                    itemManager.getItem(item.getId())?.setSpritePosition(x, y);
                    console.log(`Loaded item sprite: ${item.getTexturePath()} at (${x}, ${y})`);
                    j++;
                };
                img.onerror = () => {
                    console.error(`Failed to load item sprite: ${item.getTexturePath()}`);
                };
                console.log(`Loading item sprite: ${item.getTexturePath()}`);
                img.src = item.getTexturePath();
            }
        }
        loadTime = performance.now() - loadTime;
        window.addEventListener("load", () => {
            console.log(`All textures loaded in ${loadTime.toFixed(2)} ms.`);
            mapRenderer.renderVisibleMap(camera);
        });
    }
    drawDynamicSprite(dynamicCreature) {
        const ctx = this.dynamicSpriteCtx;
        const spriteSize = this.getSpriteSize();
        const { x, y } = this.getDynamicSpriteTexturePosition(dynamicCreature);
        ctx.clearRect(x, y, spriteSize, spriteSize); // Clear the area for this creature's sprite
        const texturesToRender = dynamicCreature.getTexturesToRender();
        const species = speciesManager.getSpeciesById(dynamicCreature.species);
        const items = texturesToRender.items;
        let imagesLoaded = 0;
        Object.values(texturesToRender).forEach((texturePath) => {
            if (Array.isArray(texturePath)) {
                return;
            }
            const img = new Image();
            img.onload = () => {
                imagesLoaded++;
                ctx.drawImage(img, x, y, spriteSize, spriteSize);
                if (imagesLoaded === 4) {
                    drawItems();
                }
                // skip the others because they're not implemented yet
            };
            img.onerror = () => {
                console.error(`Failed to load dynamic creature body texture: ${texturePath}`);
            };
            img.src = texturePath;
        });
        //while (imagesLoaded < 4) {}
        const drawItems = () => {
            items.forEach((item) => {
                const position = itemManager.getItem(item.getId())?.getSpritePosition();
                console.log(item.getId(), position);
                if (item instanceof Weapon) {
                    const { width, height } = item.getSizeOnRender();
                    const anchor = species.getAnchorPoints()[item.getAnchorPoint()];
                    ctx.drawImage(this.itemSprites, position.x, position.y, this.getSpriteSize(), this.getSpriteSize(), x + anchor.x - width / 2, y + anchor.y - height / 2, width, height);
                }
                if (item instanceof Armor) {
                    const equippableData = item.getEquippableItemData();
                    equippableData.forEach((data) => {
                        console.log(data);
                        const { width, height } = data.sizeOnRender || { width: this.getSpriteSize(), height: this.getSpriteSize() };
                        const anchor = species.getAnchorPoints()[data.anchorPoint || AnchorPointType.body];
                        console.log(anchor);
                        ctx.drawImage(this.itemSprites, data.texturePosition?.x || 0, data.texturePosition?.y || 0, this.getSpriteSize(), this.getSpriteSize(), x + anchor.x - width / 2, y + anchor.y - height / 2, width, height);
                    });
                }
            });
        };
    }
    getDynamicSpriteTexturePosition(dynamicCreature) {
        const index = dynamicCreature.getIndex();
        const x = (index % this.texturesPerRow) * this.getSpriteSize();
        const y = Math.floor(index / this.texturesPerRow) * this.getSpriteSize();
        return { x, y };
    }
}
const atlas = new Atlas(96, 8);
//# sourceMappingURL=atlas.js.map