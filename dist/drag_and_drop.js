"use strict";
(function () {
    const dragAndSortHolders = document.querySelectorAll('[drag_and_sort=true]');
    if (!dragAndSortHolders) {
        return;
    }
    dragAndSortHolders.forEach((holder) => {
        holder.addEventListener('dragstart', (event) => {
            dragstartHandle(event, holder);
        });
        holder.addEventListener('dragend', (event) => {
            dragendHandle(event, holder);
        });
        holder.addEventListener('dragover', (event) => {
            dragoverHandle(event, holder);
        });
    });
})();
(function () {
    const dragAndCloneHolders = document.querySelectorAll('[drag_and_clone=true]');
    if (!dragAndCloneHolders) {
        return;
    }
    dragAndCloneHolders.forEach((holder) => {
        let draggableClone;
        holder.addEventListener('dragstart', (event) => {
            dragstartHandle(event, holder);
            const target = event.target;
            draggableClone = target.cloneNode(true);
            draggableClone.classList.add('dragging');
            draggableClone.style.display = "none";
        });
        holder.addEventListener('dragend', (event) => {
            dragendHandle(event, holder);
        });
        holder.addEventListener('dragover', (event) => {
            dragoverHandle(event, holder, draggableClone);
            draggableClone.classList.remove('dragging');
            draggableClone.removeAttribute("style");
        });
    });
})();
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
function dragoverHandle(event, holder, cloneElement) {
    event.preventDefault();
    const target = event.target;
    if (!target || target.getAttribute('container') !== 'true') {
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
