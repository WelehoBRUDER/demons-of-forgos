"use strict";
var OptionDataType;
(function (OptionDataType) {
    OptionDataType["textInput"] = "string";
    OptionDataType["numberInput"] = "number";
    OptionDataType["checkbox"] = "boolean";
    OptionDataType["slider"] = "number";
    OptionDataType["dropdown"] = "number";
})(OptionDataType || (OptionDataType = {}));
class ObjectEditor {
    object;
    dynamicEditPanel = document.querySelector(".dynamic-edit");
    constructor() { }
    openForObject(object) {
        this.close(); // Clear any existing content
        this.object = object;
        const mainLabel = document.createElement("h2");
        mainLabel.textContent = `Editing Object: ${object.getId()}`;
        this.dynamicEditPanel.appendChild(mainLabel);
        const editorData = object.getEditorDynamicData();
        for (const [key, data] of Object.entries(editorData)) {
            const container = document.createElement("div");
            container.classList.add("editor-data-container");
            const label = document.createElement("label");
            label.textContent = key;
            const inputElement = this.createInputForEditorData(key, data);
            label.htmlFor = `${key}-input`;
            inputElement.id = `${key}-input`;
            inputElement.addEventListener("change", () => {
                this.handleEditorDataChange(key, inputElement, data);
            });
            container.append(label, inputElement);
            this.dynamicEditPanel.append(container);
        }
        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove Object";
        removeButton.addEventListener("click", () => {
            // Remove the object from the map's dynamicObjects array
            const map = editor.getMap();
            if (map) {
                editor.dispatch(new ObjectRemoveCommand(object.getStrippedData())); // Dispatch a command to remove the object, which will also handle undo/redo functionality
                //map.removeDynamicObjectByUID(object.getUID());
                this.close(); // Close the editor after removing the object
                //mapRenderer.renderObjects(camera); // Re-render the map to reflect the removed object
            }
        });
        this.dynamicEditPanel.appendChild(removeButton);
    }
    handleEditorDataChange(key, inputElement, data) {
        let newValue;
        switch (data.optionType) {
            case EditorDataOptionType.textInput:
                newValue = inputElement.value;
                break;
            case EditorDataOptionType.numberInput:
                newValue = inputElement.valueAsNumber;
                break;
            case EditorDataOptionType.checkbox:
                newValue = inputElement.checked;
                break;
            case EditorDataOptionType.dropdown:
                newValue = inputElement.value;
                break;
        }
        console.log(`Changed ${key} to ${newValue}`);
        const type = OptionDataType[data.optionType];
        if (type === OptionDataType.numberInput) {
            newValue = Number(newValue);
        }
        // @ts-ignore
        this.object[data.setValue](newValue); // Call the appropriate setter method on the object with the new value
        mapRenderer.renderObjects(camera); // Re-render the map to reflect changes
        this.openForObject(this.object); // Re-open the editor for the same object to update displayed values (this is a bit of a hack, ideally we would just update the relevant input fields without re-rendering the entire editor, but this ensures everything stays in sync)
    }
    createInputForEditorData(key, data) {
        let inputElement;
        switch (data.optionType) {
            case EditorDataOptionType.textInput:
                const textInput = document.createElement("input");
                textInput.type = "text";
                textInput.value = data.value;
                textInput.disabled = data.locked;
                inputElement = textInput;
                break;
            case EditorDataOptionType.numberInput:
                const numberInput = document.createElement("input");
                numberInput.type = "number";
                numberInput.value = data.value;
                numberInput.disabled = data.locked;
                inputElement = numberInput;
                break;
            case EditorDataOptionType.checkbox:
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.checked = data.value;
                checkbox.disabled = data.locked;
                inputElement = checkbox;
                break;
            case EditorDataOptionType.dropdown:
                const dropdown = document.createElement("select");
                if (data.optionValues) {
                    data.optionValues.forEach((optionValue) => {
                        const option = document.createElement("option");
                        option.value = optionValue;
                        option.textContent = optionValue;
                        if (optionValue === data.value) {
                            option.selected = true;
                        }
                        dropdown.appendChild(option);
                    });
                }
                dropdown.disabled = data.locked;
                inputElement = dropdown;
                break;
            default:
                throw new Error(`Unsupported editor data option type: ${data.optionType}`);
        }
        return inputElement;
    }
    close() {
        this.dynamicEditPanel.innerHTML = "";
    }
}
const objectEditor = new ObjectEditor();
//# sourceMappingURL=object_editor.js.map