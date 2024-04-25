"use strict";
function initDragAndSort(options) {
    const holder = document.querySelector(`#${options.wrapperId}`);
    if (!holder) {
        return;
    }
    holder.addEventListener('dragstart', (event) => {
        var _a;
        dragstartHandle(event, holder);
        (_a = options === null || options === void 0 ? void 0 : options.afterDragstartCallback) === null || _a === void 0 ? void 0 : _a.call(options);
    });
    holder.addEventListener('dragend', (event) => {
        var _a;
        dragendHandle(event, holder);
        (_a = options === null || options === void 0 ? void 0 : options.afterDragendCallback) === null || _a === void 0 ? void 0 : _a.call(options);
    });
    holder.addEventListener('dragover', (event) => {
        var _a;
        dragoverHandle(event, holder, options.sortableContainerId);
        (_a = options === null || options === void 0 ? void 0 : options.afterDragoverCallback) === null || _a === void 0 ? void 0 : _a.call(options);
    });
}
function initDragAndClone(options) {
    const holder = document.querySelector(`#${options.wrapperId}`);
    if (!holder) {
        return;
    }
    let draggableClone;
    holder.addEventListener('dragstart', (event) => {
        var _a;
        dragstartHandle(event, holder);
        const target = event.target;
        draggableClone = target.cloneNode(true);
        draggableClone.classList.add('dragging');
        draggableClone.style.display = "none";
        (_a = options === null || options === void 0 ? void 0 : options.afterDragstartCallback) === null || _a === void 0 ? void 0 : _a.call(options);
    });
    holder.addEventListener('dragend', (event) => {
        var _a;
        dragendHandle(event, holder);
        (_a = options === null || options === void 0 ? void 0 : options.afterDragendCallback) === null || _a === void 0 ? void 0 : _a.call(options);
    });
    holder.addEventListener('dragover', (event) => {
        var _a;
        dragoverHandle(event, holder, options.cloneToContainerId, draggableClone);
        draggableClone.classList.remove('dragging');
        draggableClone.removeAttribute("style");
        (_a = options === null || options === void 0 ? void 0 : options.afterDragoverCallback) === null || _a === void 0 ? void 0 : _a.call(options);
    });
}
function getDragAfterElement(container, y) {
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
}
function dragstartHandle(event, holder) {
    const target = event.target;
    if (!target || target.getAttribute('draggable') !== 'true') {
        return;
    }
    target.classList.add('dragging');
}
function dragendHandle(event, holder) {
    const target = event.target;
    if (!target || target.getAttribute('draggable') !== 'true') {
        return;
    }
    target.classList.remove('dragging');
}
function dragoverHandle(event, holder, containerId, cloneElement) {
    event.preventDefault();
    const target = event.target;
    if (!target || target.id !== containerId || target.contains(holder)) {
        return;
    }
    const afterElement = getDragAfterElement(target, event.clientY);
    const draggable = cloneElement ? cloneElement : holder.querySelector('.dragging');
    if (afterElement == null) {
        target.appendChild(draggable);
    }
    else {
        target.insertBefore(draggable, afterElement);
    }
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
    sortableTargetContainer: true,
};
// initDragAndSort(sortOptions);
// initDragAndClone(cloneOptions);
