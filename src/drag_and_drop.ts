(function () {
    const dragAndDropHolders: NodeListOf<HTMLElement> = document.querySelectorAll('[drag_and_drop=true]')

    if (!dragAndDropHolders) {
        return;
    }

    dragAndDropHolders.forEach(holder => {

        holder.addEventListener('dragstart', function (event) {
            const target = event.target as HTMLElement;

            if (!target) {
                return;
            }

            if (target.getAttribute('draggable') !== 'true') {
                return;
            }

            target.classList.add('dragging');
        });

        holder.addEventListener('dragend', function (event) {
            const target = event.target as HTMLElement;

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
            const target = event.target as HTMLElement;

            if (!target) {
                return;
            }

            if (target.getAttribute('container') !== 'true') {
                return;
            }

            const afterElement = getDragAfterElement(target, event.clientY);
            const draggable = holder.querySelector('.dragging')!;

            if (afterElement == null) {
                target.appendChild(draggable);
            } else {
                target.insertBefore(draggable, afterElement);
            }

        })
    });

    function getDragAfterElement(container: HTMLElement, y: number) {
        const draggableElements = Array.from(container.querySelectorAll<HTMLElement>('[draggable=true]:not(.dragging)'));

        return draggableElements.reduce((closest: { offset: number, element: HTMLElement } | null, child: HTMLElement) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > (closest ? closest.offset : Number.NEGATIVE_INFINITY)) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, null)?.element;
    }

})()
