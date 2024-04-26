"use strict";
function initDragAndDrop(options) {
    if (!options.type) {
        throw new Error("Drag And Drop: property 'type' not specified!");
    }
    if (!options.wrapperId || options.wrapperId == "") {
        throw new Error("Drag And Drop: property 'wrapperId' not specified!");
    }
    const initDragAndSort = (options) => {
        const holder = document.querySelector(`#${options.wrapperId}`);
        if (!holder) {
            throw new Error(`Drag And Drop: Element with id '${options.wrapperId}' was not found when initializing 'Drag And Sort'!`);
        }
        holder.addEventListener('dragstart', (event) => {
            var _a;
            dragstartHandle(event, holder, options);
            (_a = options === null || options === void 0 ? void 0 : options.afterDragstartCallback) === null || _a === void 0 ? void 0 : _a.call(options, event.target, holder);
        });
        holder.addEventListener('dragend', (event) => {
            var _a;
            dragendHandle(event, holder);
            (_a = options === null || options === void 0 ? void 0 : options.afterDragendCallback) === null || _a === void 0 ? void 0 : _a.call(options, event.target, holder);
        });
        holder.addEventListener('dragover', (event) => {
            var _a;
            dragoverHandle(event, holder, options);
            (_a = options === null || options === void 0 ? void 0 : options.afterDragoverCallback) === null || _a === void 0 ? void 0 : _a.call(options, event.target, holder);
        });
    };
    const initDragAndClone = (options) => {
        const holder = document.querySelector(`#${options.wrapperId}`);
        if (!holder) {
            throw new Error(`Drag And Drop: Element with id '${options.wrapperId}' was not found when initializing 'Drag And Clone'!`);
        }
        let draggableClone;
        holder.addEventListener('dragstart', (event) => {
            var _a;
            const target = event.target;
            dragstartHandle(event, holder, options);
            if (target.parentElement && target.parentElement.id == options.cloneFromContainerId) {
                draggableClone = target.cloneNode(true);
                draggableClone.classList.add('dragging');
                draggableClone.style.display = "none";
            }
            (_a = options === null || options === void 0 ? void 0 : options.afterDragstartCallback) === null || _a === void 0 ? void 0 : _a.call(options, event.target, holder, draggableClone);
        });
        holder.addEventListener('dragend', (event) => {
            var _a;
            dragendHandle(event, holder);
            (_a = options === null || options === void 0 ? void 0 : options.afterDragendCallback) === null || _a === void 0 ? void 0 : _a.call(options, event.target, holder, draggableClone);
            draggableClone = undefined;
        });
        holder.addEventListener('dragover', (event) => {
            var _a;
            draggableClone ? dragoverHandle(event, holder, options, draggableClone) : dragoverHandle(event, holder, options);
            if (draggableClone) {
                draggableClone.classList.remove('dragging');
                draggableClone.removeAttribute("style");
            }
            (_a = options === null || options === void 0 ? void 0 : options.afterDragoverCallback) === null || _a === void 0 ? void 0 : _a.call(options, event.target, holder, draggableClone);
        });
    };
    switch (options.type.toLocaleLowerCase()) {
        case "sort":
            options = options;
            if (!options.sortableContainerId) {
                throw new Error("Drag And Drop: property 'sortableContainerId' not specified!");
            }
            initDragAndSort(options);
            break;
        case "clone":
            options = options;
            if (!options.cloneFromContainerId) {
                throw new Error("Drag And Drop: property 'cloneFromContainerId' not specified!");
            }
            if (!options.cloneToContainerId) {
                throw new Error("Drag And Drop: property 'cloneToContainerId' not specified!");
            }
            initDragAndClone(options);
            break;
        default:
            throw new Error("Drag And Drop: Unsupported type!");
    }
    const getDragAfterElement = (container, y) => {
        var _a;
        const draggableElements = Array.from(container.querySelectorAll('[draggable=true]:not(.dragging)'));
        return (_a = draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > (closest ? closest.offset : Number.NEGATIVE_INFINITY)) {
                return { offset: offset, element: child };
            }
            else {
                return closest;
            }
        }, null)) === null || _a === void 0 ? void 0 : _a.element;
    };
    const dragstartHandle = (event, holder, options) => {
        const target = event.target;
        if (!target || target.getAttribute('draggable') !== 'true') {
            return;
        }
        if (options.type == 'sort' && target.parentElement && target.parentElement.id !== options.sortableContainerId) {
            return;
        }
        target.classList.add('dragging');
    };
    const dragendHandle = (event, holder) => {
        const target = event.target;
        if (!target || target.getAttribute('draggable') !== 'true') {
            return;
        }
        target.classList.remove('dragging');
    };
    const dragoverHandle = (event, holder, options, cloneElement) => {
        event.preventDefault();
        const target = event.target;
        const targetId = options.type == 'sort' ? options.sortableContainerId : options.cloneToContainerId;
        if (!target || target.id !== targetId || target.contains(holder)) {
            return;
        }
        const afterElement = getDragAfterElement(target, event.clientY);
        const draggable = cloneElement ? cloneElement : holder.querySelector('.dragging');
        if (!draggable) {
            return;
        }
        if (afterElement == null) {
            target.appendChild(draggable);
        }
        else {
            target.insertBefore(draggable, afterElement);
        }
    };
}
const sortOptions = {
    wrapperId: "wrapper",
    type: "sort",
    sortableContainerId: "container",
};
const cloneOptions = {
    wrapperId: "wrapper",
    type: "clone",
    cloneFromContainerId: "fromContainer",
    cloneToContainerId: "container",
};
initDragAndDrop(cloneOptions);
