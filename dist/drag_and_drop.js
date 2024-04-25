"use strict";
(function () {
    const dragAndDropHolders = document.querySelectorAll('[drag_and_drop=true]');
    if (!dragAndDropHolders) {
        return;
    }
    dragAndDropHolders.forEach(holder => {
        holder.addEventListener('dragstart', function (event) {
            const target = event.target;
            if (!target) {
                return;
            }
            if (target.getAttribute('draggable') !== 'true') {
                return;
            }
            target.classList.add('dragging');
        });
        holder.addEventListener('dragend', function (event) {
            const target = event.target;
            if (!target) {
                return;
            }
            if (target.getAttribute('draggable') !== 'true') {
                return;
            }
            target.classList.remove('dragging');
        });
        holder.addEventListener('dragover', function (event) {
            event.preventDefault();
            const target = event.target;
            if (!target) {
                return;
            }
            if (target.getAttribute('container') !== 'true') {
                return;
            }
            const afterElement = getDragAfterElement(target, event.clientY);
            const draggable = holder.querySelector('.dragging');
            if (afterElement == null) {
                target.appendChild(draggable);
            }
            else {
                target.insertBefore(draggable, afterElement);
            }
        });
    });
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
})();
