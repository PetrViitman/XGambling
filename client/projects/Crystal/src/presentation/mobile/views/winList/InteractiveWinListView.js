import {Graphics} from 'pixi.js';
import {WinListView} from './WinListView';
import {ScrollBarView} from './ScrollBarView';

export class InteractiveWinListView extends WinListView {
    interactiveLayerView;

    scrollBarView;

    clickY;

    itemsContainerPendingY;

    pendingScrollProgress = 0;

    scrollProgress = 1;
    
    graphics;

    constructor({
        assets,
        isRTL,
    }) {
        super({
            assets,
            isRTL,
        });

        this.initScrollBar();
        this.initInteractiveLayer();
        this.setInteractive();
        this.setScrollProgress();

        this.setMaskSize(315, 480);
    }

    initInteractiveLayer() {
        const view = this.addChild(new Graphics())
            .beginFill(0xFFFFFF, 0.0001)
            .drawRect(
                0,
                0,
                285,
                123,
            )
            .endFill();
        view.on('pointerdown', (e) => { this.onClick(e); });
        view.on('pointerup', (e) => { this.onDrop(e); });
        view.on('pointerupoutside', (e) => { this.onDrop(e); });
        view.on('globalpointermove', (e) => { this.clickY === undefined || this.onSlide(e); });
        view.on('wheel', (e) => { this.onWheel(e); }, {passive: false});

        this.interactiveLayerView = view;
    }

    initScrollBar() {
        this.scrollBarView = this.addChild(new ScrollBarView());
        this.scrollBarView.y = 5;
        this.scrollBarView.scale.set(0.975);
    }

    setInteractive(isInteractive = true) {
        const {
            itemsContainer,
            interactiveLayerView,
            scrollBarView,
            isRTL,
        } = this;

        interactiveLayerView.eventMode = isInteractive ? 'static' : 'none';
        interactiveLayerView.cursor = isInteractive ? 'pointer' : 'default';

        scrollBarView.visible = isInteractive;
        scrollBarView.x = isRTL ? 5 : 277;

        if (isRTL) {
            itemsContainer.x = isInteractive ? 26 : 21;

            return;
        }

        itemsContainer.x = isInteractive ? 16 : 21;

        this.setExpansionFactor(this.expansionFactor);
    }

    onClick(e) {
        if (this.itemsContainer.height <= this.mask.height) {
            return;
        }

        this.clickY = this.toLocal(e.global).y;
        this.itemsContainerPendingY = this.itemsContainer.y - this.mask.height;
        this.pendingScrollProgress = this.scrollProgress;
    }

    onSlide(e) {
        const y = this.toLocal(e.global).y;
        const visibleHeight = this.mask.height;
        const slideDelta = y - this.clickY;


        this.setScrollProgress(
            1 -
            (this.itemsContainerPendingY + slideDelta)
            / (this.itemsContainer.height - visibleHeight),
        );
    }

    onDrop() {
        this.clickY = undefined;
    }

    onWheel(e) {
        const visibleHeight = this.mask.height;
        const contentHeight = this.itemsContainer.height;
        const scrollMultiplier = 0.1 * Math.min(1.5, contentHeight / visibleHeight);

        this.setScrollProgress(
            this.scrollProgress + ((e.deltaY / Math.abs(e.deltaY)) * scrollMultiplier),
        );

        e.preventDefault();
        e.stopPropagation();
    }

    setScrollProgress(progress = this.scrollProgress) {
        const {
            itemsContainer,
            scrollBarView,
        } = this;

        const scrollProgress = Math.min(1, Math.max(0, progress));
        const contentHeight = itemsContainer.height;
        const visibleContentHeight = this.mask.height;
        const scaleFactor = Math.min(1, visibleContentHeight / contentHeight);
        
        const scrollBarHeight = visibleContentHeight * scaleFactor;
        scrollBarView.setHandleHeight(scrollBarHeight);
        scrollBarView.handleView.y = (visibleContentHeight - scrollBarHeight) * scrollProgress;

        itemsContainer.y = visibleContentHeight
            + (contentHeight - visibleContentHeight) * (1 - scrollProgress);

        this.setInteractive(scaleFactor < 1);
        this.scrollProgress = scrollProgress;
    }

    onItemsDrop() {
        this.scrollBarView.visible = false;
        this.setInteractive(false);
    }

    onWinPresentation() {
        this.setScrollProgress();
    }

    presentWin(descriptors) {
        this.setScrollProgress(1);
        
        return super.presentWin(descriptors);
    }

    setExpansionFactor(expansionFactor = 1) {
        super.setExpansionFactor(expansionFactor);

        this.interactiveLayerView.scale.x = expansionFactor;

        this.scrollBarView.x = this.isRTL
            ? 5
            : this.itemsContainer.width + 14;
    }

    setMaskSize(width, height) {
        super.setMaskSize(width, height);
        this.scrollBarView.setHeight(height);

        this.interactiveLayerView.width = width;
        this.interactiveLayerView.height = height;
    }
}
