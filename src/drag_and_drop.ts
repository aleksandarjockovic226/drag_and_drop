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
    sortableTargetContainer?: true | false
}

function initDragAndDrop(options: InitDragAndSort | InitDragAndClone) {
    if (!options.type) {
        throw new Error("Drag And Drop: property 'type' not specified!");
    }

    if (!options.wrapperId || options.wrapperId == "") {
        throw new Error("Drag And Drop: property 'wrapperId' not specified!");
    }

    const initDragAndSort = (options: InitDragAndSort) => {
        const holder: HTMLElement = document.querySelector(`#${options.wrapperId}`) as HTMLElement;

        if (!holder) {
            throw new Error(`Drag And Drop: Element with id '${options.wrapperId}' was not found when initializing 'Drag And Sort'!`);
        }

        holder.addEventListener('dragstart', (event) => {
            dragstartHandle(event, holder, options);
            options?.afterDragstartCallback?.();
        });
        holder.addEventListener('dragend', (event) => {
            dragendHandle(event, holder);
            options?.afterDragendCallback?.();
        });
        holder.addEventListener('dragover', (event) => {
            dragoverHandle(event, holder, options);
            options?.afterDragoverCallback?.();
        });
    }

    const initDragAndClone = (options: InitDragAndClone) => {
        const holder: HTMLElement = document.querySelector(`#${options.wrapperId}`) as HTMLElement;

        if (!holder) {
            throw new Error(`Drag And Drop: Element with id '${options.wrapperId}' was not found when initializing 'Drag And Clone'!`);
        }

        let draggableClone: HTMLElement;

        holder.addEventListener('dragstart', (event) => {
            const target = event.target as HTMLElement;

            dragstartHandle(event, holder, options);

            if (target.parentElement && target.parentElement.id == options.cloneFromContainerId) {
                draggableClone = target.cloneNode(true) as HTMLElement;
                
                // TODO: sortableTargetContainer: false, fix for cloned elements!

                draggableClone.classList.add('dragging');
                draggableClone.style.display = "none";

            }
            options?.afterDragstartCallback?.();
        });
        holder.addEventListener('dragend', (event) => {
            dragendHandle(event, holder);
            options?.afterDragendCallback?.();
        });
        holder.addEventListener('dragover', (event) => {
            if (!draggableClone) {
                return
            }

            dragoverHandle(event, holder, options, draggableClone);

            draggableClone.classList.remove('dragging');
            draggableClone.removeAttribute("style");

            options?.afterDragoverCallback?.();
        });
    }

    switch (options.type.toLocaleLowerCase()) {
        case "sort":
            options = options as InitDragAndSort;

            if (!options.sortableContainerId) {
                throw new Error("Drag And Drop: property 'sortableContainerId' not specified!");
            }

            initDragAndSort(options);
            break;
        case "clone":
            options = options as InitDragAndClone;

            if (!options.cloneFromContainerId) {
                throw new Error("Drag And Drop: property 'cloneFromContainerId' not specified!");
            }

            if (!options.cloneToContainerId) {
                throw new Error("Drag And Drop: property 'cloneToContainerId' not specified!");
            }

            if (!options.sortableTargetContainer) {
                options.sortableTargetContainer = true;
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

    const dragstartHandle = (event: DragEvent, holder: HTMLElement, options: InitDragAndSort | InitDragAndClone) => {
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

    const dragoverHandle = (event: DragEvent, holder: HTMLElement, options: InitDragAndSort | InitDragAndClone, cloneElement?: HTMLElement) => {
        event.preventDefault();
        const target = event.target as HTMLElement;
        const targetId = options.type == 'sort' ? options.sortableContainerId : options.cloneToContainerId;

        if (!target || target.id !== targetId || target.contains(holder)) {
            return;
        }

        if (options.type == 'clone' && !options.sortableTargetContainer) {
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
    sortableTargetContainer: false
};

initDragAndDrop(cloneOptions);