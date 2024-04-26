interface DragAndDrop {
    wrapperId: string;
    type: "sort" | "clone";
    afterDragstartCallback?: (target: HTMLElement, holder: HTMLElement, clone?: HTMLElement | undefined) => void;
    afterDragendCallback?: (target: HTMLElement, holder: HTMLElement, clone?: HTMLElement | undefined) => void;
    afterDragoverCallback?: (target: HTMLElement, holder: HTMLElement, clone?: HTMLElement | undefined) => void;
}

interface DragAndSort extends DragAndDrop {
    type: "sort";
    sortableContainerId: string;
}

interface DragAndClone extends DragAndDrop {
    type: "clone";
    cloneFromContainerId: string,
    cloneToContainerId: string,
}

function initDragAndDrop(options: DragAndSort | DragAndClone) {
    if (!options.type) {
        throw new Error("Drag And Drop: property 'type' not specified!");
    }

    if (!options.wrapperId || options.wrapperId == "") {
        throw new Error("Drag And Drop: property 'wrapperId' not specified!");
    }

    const initDragAndSort = (options: DragAndSort) => {
        const holder: HTMLElement = document.querySelector(`#${options.wrapperId}`) as HTMLElement;

        if (!holder) {
            throw new Error(`Drag And Drop: Element with id '${options.wrapperId}' was not found when initializing 'Drag And Sort'!`);
        }

        holder.addEventListener('dragstart', (event) => {
            dragstartHandle(event, holder, options);
            options?.afterDragstartCallback?.(event.target as HTMLElement, holder as HTMLElement);
        });
        holder.addEventListener('dragend', (event) => {
            dragendHandle(event, holder);
            options?.afterDragendCallback?.(event.target as HTMLElement, holder as HTMLElement);
        });
        holder.addEventListener('dragover', (event) => {
            dragoverHandle(event, holder, options);
            options?.afterDragoverCallback?.(event.target as HTMLElement, holder as HTMLElement);
        });
    }

    const initDragAndClone = (options: DragAndClone) => {
        const holder: HTMLElement = document.querySelector(`#${options.wrapperId}`) as HTMLElement;

        if (!holder) {
            throw new Error(`Drag And Drop: Element with id '${options.wrapperId}' was not found when initializing 'Drag And Clone'!`);
        }

        let draggableClone: HTMLElement | undefined;

        holder.addEventListener('dragstart', (event) => {
            const target = event.target as HTMLElement;

            dragstartHandle(event, holder, options);

            if (target.parentElement && target.parentElement.id == options.cloneFromContainerId) {
                draggableClone = target.cloneNode(true) as HTMLElement;
                draggableClone.classList.add('dragging');
                draggableClone.style.display = "none";
            }

            options?.afterDragstartCallback?.(event.target as HTMLElement, holder as HTMLElement, draggableClone);
        });
        holder.addEventListener('dragend', (event) => {
            dragendHandle(event, holder);

            options?.afterDragendCallback?.(event.target as HTMLElement, holder as HTMLElement, draggableClone);
            draggableClone = undefined;
        });
        holder.addEventListener('dragover', (event) => {
            draggableClone ? dragoverHandle(event, holder, options, draggableClone) : dragoverHandle(event, holder, options);

            if (draggableClone) {
                draggableClone.classList.remove('dragging');
                draggableClone.removeAttribute("style");
            }

            options?.afterDragoverCallback?.(event.target as HTMLElement, holder as HTMLElement, draggableClone);
        });
    }

    switch (options.type.toLocaleLowerCase()) {
        case "sort":
            options = options as DragAndSort;

            if (!options.sortableContainerId) {
                throw new Error("Drag And Drop: property 'sortableContainerId' not specified!");
            }

            initDragAndSort(options);
            break;
        case "clone":
            options = options as DragAndClone;

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

    const getDragAfterElement = (container: HTMLElement, y: number) => {
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

    const dragstartHandle = (event: DragEvent, holder: HTMLElement, options: DragAndSort | DragAndClone) => {
        const target = event.target as HTMLElement;
        if (!target || target.getAttribute('draggable') !== 'true') {
            return;
        }

        if (options.type == 'sort' && target.parentElement && target.parentElement.id !== options.sortableContainerId) {
            return;
        }

        target.classList.add('dragging');
    }

    const dragendHandle = (event: DragEvent, holder: HTMLElement) => {
        const target = event.target as HTMLElement;
        if (!target || target.getAttribute('draggable') !== 'true') {
            return;
        }

        target.classList.remove('dragging');
    }

    const dragoverHandle = (event: DragEvent, holder: HTMLElement, options: DragAndSort | DragAndClone, cloneElement?: HTMLElement) => {
        event.preventDefault();
        const target = event.target as HTMLElement;
        const targetId = options.type == 'sort' ? options.sortableContainerId : options.cloneToContainerId;

        if (!target || target.id !== targetId || target.contains(holder)) {
            return;
        }

        const afterElement = getDragAfterElement(target, event.clientY);
        const draggable = cloneElement ? cloneElement : holder.querySelector('.dragging')!;

        if (!draggable) {
            return;
        }

        if (afterElement == null) {
            target.appendChild(draggable);
        } else {
            target.insertBefore(draggable, afterElement);
        }
    }
}

const sortOptions: DragAndSort = {
    wrapperId: "wrapper",
    type: "sort",
    sortableContainerId: "container",
};

const cloneOptions: DragAndClone = {
    wrapperId: "wrapper",
    type: "clone",
    cloneFromContainerId: "fromContainer",
    cloneToContainerId: "container",
};

initDragAndDrop(cloneOptions);