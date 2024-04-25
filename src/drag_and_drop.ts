interface InitDragAndDrop {
    wrapperId: string;
    type: "sort" | "clone";
    afterDragstartCallback?: () => void;
    afterDragendCallback?: () => void;
    afterDragoverCallback?: () => void;
}

interface InitDragAndSort extends InitDragAndDrop {
    type: "sort";
    sortableContainerId: string;
}

interface InitDragAndClone extends InitDragAndDrop {
    type: "clone";
    cloneFromContainerId: string,
    cloneToContainerId: string,
    sortableTargetContainer?: true
}

function initDragAndSort(options: InitDragAndSort) {
    const holder: HTMLElement = document.querySelector(`#${options.wrapperId}`) as HTMLElement;

    if (!holder) {
        return;
    }

    holder.addEventListener('dragstart', (event) => {
        dragstartHandle(event, holder);
        options?.afterDragstartCallback?.();
    });
    holder.addEventListener('dragend', (event) => {
        dragendHandle(event, holder);
        options?.afterDragendCallback?.();
    });
    holder.addEventListener('dragover', (event) => {
        dragoverHandle(event, holder, options.sortableContainerId);
        options?.afterDragoverCallback?.();
    });
}

function initDragAndClone(options: InitDragAndClone) {
    const holder: HTMLElement = document.querySelector(`#${options.wrapperId}`) as HTMLElement;

    if (!holder) {
        return;
    }

    let draggableClone: HTMLElement;

    holder.addEventListener('dragstart', (event) => {
        dragstartHandle(event, holder);

        const target = event.target as HTMLElement;
        draggableClone = target.cloneNode(true) as HTMLElement;
        draggableClone.classList.add('dragging');
        draggableClone.style.display = "none";

        options?.afterDragstartCallback?.();
    });
    holder.addEventListener('dragend', (event) => {
        dragendHandle(event, holder);
        options?.afterDragendCallback?.();
    });
    holder.addEventListener('dragover', (event) => {
        dragoverHandle(event, holder, options.cloneToContainerId, draggableClone);

        draggableClone.classList.remove('dragging');
        draggableClone.removeAttribute("style");

        options?.afterDragoverCallback?.();
    });
}

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

function dragoverHandle(event: DragEvent, holder: HTMLElement, containerId: string, cloneElement?: HTMLElement) {
    event.preventDefault();
    const target = event.target as HTMLElement;
    if (!target || target.id !== containerId || target.contains(holder)) {
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

const sortOptions: InitDragAndSort = {
    wrapperId: "wrapper",
    type: "sort",
    sortableContainerId: "container",
};

const cloneOptions: InitDragAndClone = {
    wrapperId: "wrapper",
    type: "clone",
    cloneFromContainerId: "fromContainer",
    cloneToContainerId: "container",
    sortableTargetContainer: true,
};

// initDragAndSort(sortOptions);
// initDragAndClone(cloneOptions);
