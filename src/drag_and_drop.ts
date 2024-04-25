(function () {
    const dragAndSortHolders: NodeListOf<HTMLElement> = document.querySelectorAll('[drag_and_sort=true]')
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
    const dragAndCloneHolders: NodeListOf<HTMLElement> = document.querySelectorAll('[drag_and_clone=true]')
    if (!dragAndCloneHolders) {
        return;
    }

    dragAndCloneHolders.forEach((holder) => {
        let draggableClone: HTMLElement;

        holder.addEventListener('dragstart', (event) => {
            dragstartHandle(event, holder);

            const target = event.target as HTMLElement;
            draggableClone = target.cloneNode(true) as HTMLElement;
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

function dragstartHandle(event: DragEvent, holder: HTMLElement) {
    const target = event.target as HTMLElement;
    if (!target || target.getAttribute('draggable') !== 'true') {
        return;
    }

    target.classList.add('dragging');
}

function dragendHandle(event: DragEvent, holder: HTMLElement) {
    const target = event.target as HTMLElement;
    if (!target || target.getAttribute('draggable') !== 'true') {
        return;
    }

    target.classList.remove('dragging');
}

function dragoverHandle(event: DragEvent, holder: HTMLElement, cloneElement?: HTMLElement) {
    event.preventDefault();
    const target = event.target as HTMLElement;
    if (!target || target.getAttribute('container') !== 'true') {
        return;
    }

    const afterElement = getDragAfterElement(target, event.clientY);

    const draggable = cloneElement ? cloneElement : holder.querySelector('.dragging')!;

    if (afterElement == null) {
        target.appendChild(draggable!);
    } else {
        target.insertBefore(draggable!, afterElement);
    }
}