import { IconPicture, IconLink } from '@codexteam/icons';
import { make } from './utils/dom';

/**
 * Class for working with UI:
 *  - rendering base structure
 *  - show/hide preview
 *  - apply tune view
 */
export default class Ui {
  /**
   * @param {object} ui - image tool Ui module
   * @param {object} ui.api - Editor.js API
   * @param {ImageConfig} ui.config - user config
   * @param {Function} ui.onSelectFile - callback for clicks on Select file button
   * @param {Function} ui.onSelectUrl - callback for clicks on Select url button
   * @param {boolean} ui.readOnly - read-only mode flag
   */
  constructor({ api, config, onSelectFile, onSelectUrl, readOnly }) {
    this.api = api;
    this.config = config;
    this.onSelectFile = onSelectFile;
    this.onSelectUrl = onSelectUrl;
    this.readOnly = readOnly;
    this.nodes = {
      wrapper: make('div', [this.CSS.baseClass, this.CSS.wrapper]),
      imageContainer: make('div', [this.CSS.imageContainer]),
      fileButton: this.createFileButton(),
      urlButton: this.createUrlButton(),
      imageEl: undefined,
      imagePreloader: make('div', this.CSS.imagePreloader),
      imageDeleteLoader: make('div', this.CSS.imageDeleteLoader),
      caption: make('div', [this.CSS.input, this.CSS.caption], {
        contentEditable: !this.readOnly,
      }),
      alt: make('div', [this.CSS.input, this.CSS.alt], {
        contentEditable: !this.readOnly,
      }),
    };
    this.fileActionCb = null;

    /**
     * Create base structure
     *  <wrapper>
     *    <image-container>
     *      <image-preloader />
     *    </image-container>
     *    <caption />
     *    <select-file-button />
     *  </wrapper>
     */
    this.nodes.caption.dataset.placeholder = this.config.captionPlaceholder;
    this.nodes.alt.dataset.placeholder = this.config.altPlaceholder;
    this.nodes.imageContainer.appendChild(this.nodes.imagePreloader);
    this.nodes.wrapper.appendChild(this.nodes.imageContainer);
    this.nodes.wrapper.appendChild(this.nodes.caption);
    this.nodes.wrapper.appendChild(this.nodes.alt);
    this.nodes.wrapper.appendChild(this.nodes.fileButton);
    this.nodes.wrapper.appendChild(this.nodes.urlButton);
  }

  /**
   * CSS classes
   *
   * @returns {object}
   */
  get CSS() {
    return {
      baseClass: this.api.styles.block,
      loading: this.api.styles.loader,
      input: this.api.styles.input,
      button: this.api.styles.button,

      /**
       * Tool's classes
       */
      wrapper: 'image-tool',
      imageContainer: 'image-tool__image',
      imagePreloader: 'image-tool__image-preloader',
      imageDeleteLoader: 'image-tool__image-deleteloader',
      imageEl: 'image-tool__image-picture',
      caption: 'image-tool__caption',
      alt: 'image-tool__alt',
      fileButton: 'image-tool__button',
      activeButton: 'image-tool__button--active',
    };
  }

  /**
   * Ui statuses:
   * - empty
   * - uploading
   * - filled
   *
   * @returns {{EMPTY: string, UPLOADING: string, FILLED: string, DELETING: string}}
   */
  static get status() {
    return {
      EMPTY: 'empty',
      UPLOADING: 'loading',
      FILLED: 'filled',
      DELETING: 'deleting',
    };
  }

  /**
   * Renders tool UI
   *
   * @param {ImageToolData} toolData - saved tool data
   * @returns {Element}
   */
  render(toolData) {
    if (!toolData.file || Object.keys(toolData.file).length === 0) {
      this.toggleStatus(Ui.status.EMPTY);
    } else {
      this.toggleStatus(Ui.status.UPLOADING);
    }

    return this.nodes.wrapper;
  }

  /**
   *
   * @param {Element} button
   * @param {string} innerHTML
   * @param {Function} onClick
   */
  attachFileButtonActions(button, innerHTML, onClick) {
    if (this.fileActionCb) {
      button.removeEventListener('click', this.fileActionCb);
    }

    button.innerHTML = innerHTML;
    this.fileActionCb = onClick;
    button.addEventListener('click', onClick);
  }

  /**
   * Creates upload-file button
   *
   * @returns {Element}
   */
  createFileButton() {
    const button = make('div', [
      this.CSS.button,
      this.CSS.fileButton,
      this.CSS.activeButton,
    ]);

    this.attachFileButtonActions(
      button,
      this.config.buttonContent ||
        `${IconPicture} ${this.api.i18n.t('Select an Image')}`,
      () => {
        this.onSelectFile();
      }
    );

    return button;
  }

  /**
   * Creates upload by url button
   *
   * @returns {Element}
   * @param {ImageToolData} toolData
   */
  createUrlButton() {
    const button = make('div', [this.CSS.button, this.CSS.fileButton]);

    this.attachFileButtonActions(
      button,
      `${IconLink} ${
        this.config.uploadWithDelegationLabel
          ? this.config.uploadWithDelegationLabel
          : 'Provide an URL'
      }`,
      () => {
        this.onSelectUrl();
      }
    );

    return button;
  }

  /**
   * Shows uploading preloader
   *
   * @param {string} src - preview source
   * @returns {void}
   */
  showPreloader(src) {
    this.nodes.imagePreloader.style.backgroundImage = `url(${src})`;

    this.toggleStatus(Ui.status.UPLOADING);
  }

  /**
   * Hide uploading preloader
   *
   * @returns {void}
   */
  hidePreloader() {
    this.nodes.imagePreloader.style.backgroundImage = '';
    this.toggleStatus(Ui.status.EMPTY);
  }

  /**
   * Toggle the active state between file button and url button
   *
   * @param {ImageToolData} toolData
   */
  toggleFileButton(toolData) {
    this.nodes.fileButton.classList.toggle(
      `${this.CSS.activeButton}`,
      !toolData.uploadByUrl
    );

    this.nodes.urlButton.classList.toggle(
      `${this.CSS.activeButton}`,
      toolData.uploadByUrl
    );
  }

  /**
   * hide buttons
   *
   * @returns {void}
   */
  hideFileButton() {
    this.nodes.fileButton.classList.toggle(`${this.CSS.activeButton}`, false);

    this.nodes.urlButton.classList.toggle(`${this.CSS.activeButton}`, false);
  }

  /**
   * Shows deleting loader
   *
   * @param {string} src - preview source
   * @returns {void}
   */
  showDeleteLoader(src) {
    // this.nodes.imageDeleteLoader.style.backgroundImage = `url(${src})`;
    this.nodes.imageDeleteLoader.textContent = 'Deleting';
    this.toggleStatus(Ui.status.DELETING);
  }

  /**
   * Hide delete loader
   *
   * @returns {void}
   */
  hideDeleteLoader() {
    this.nodes.imageDeleteLoader.style.backgroundImage = '';
    this.toggleStatus(Ui.status.EMPTY);
  }

  /**
   * Shows an image
   *
   * @param {string} url - image source
   * @returns {void}
   */
  fillImage(url) {
    /**
     * Check for a source extension to compose element correctly: video tag for mp4, img — for others
     */
    const tag = /\.mp4$/.test(url) ? 'VIDEO' : 'IMG';

    const attributes = {
      src: url,
    };

    /**
     * We use eventName variable because IMG and VIDEO tags have different event to be called on source load
     * - IMG: load
     * - VIDEO: loadeddata
     *
     * @type {string}
     */
    let eventName = 'load';

    /**
     * Update attributes and eventName if source is a mp4 video
     */
    if (tag === 'VIDEO') {
      /**
       * Add attributes for playing muted mp4 as a gif
       *
       * @type {boolean}
       */
      attributes.autoplay = true;
      attributes.loop = true;
      attributes.muted = true;
      attributes.playsinline = true;

      /**
       * Change event to be listened
       *
       * @type {string}
       */
      eventName = 'loadeddata';
    }

    /**
     * Compose tag with defined attributes
     *
     * @type {Element}
     */
    this.nodes.imageEl = make(tag, this.CSS.imageEl, attributes);

    /**
     * Add load event listener
     */
    this.nodes.imageEl.addEventListener(eventName, () => {
      this.toggleStatus(Ui.status.FILLED);

      /**
       * Preloader does not exists on first rendering with presaved data
       */
      if (this.nodes.imagePreloader) {
        this.nodes.imagePreloader.style.backgroundImage = '';
      }
    });

    this.nodes.imageContainer.appendChild(this.nodes.imageEl);
  }

  /**
   * Shows caption input
   *
   * @param {string} text - caption text
   * @returns {void}
   */
  fillCaption(text) {
    if (this.nodes.caption) {
      this.nodes.caption.innerHTML = text;
    }
  }

  /**
   * Shows alt input
   *
   * @param {string} text - caption text
   * @returns {void}
   */
  fillAlt(text) {
    if (this.nodes.alt) {
      this.nodes.alt.innerHTML = text;
    }
  }

  /**
   * Changes UI status
   *
   * @param {string} status - see {@link Ui.status} constants
   * @returns {void}
   */
  toggleStatus(status) {
    for (const statusType in Ui.status) {
      if (Object.prototype.hasOwnProperty.call(Ui.status, statusType)) {
        this.nodes.wrapper.classList.toggle(
          `${this.CSS.wrapper}--${Ui.status[statusType]}`,
          status === Ui.status[statusType]
        );
      }
    }
  }

  /**
   * Apply visual representation of activated tune
   *
   * @param {string} tuneName - one of available tunes {@link Tunes.tunes}
   * @param {boolean} status - true for enable, false for disable
   * @returns {void}
   */
  applyTune(tuneName, status) {
    this.nodes.wrapper.classList.toggle(
      `${this.CSS.wrapper}--${tuneName}`,
      status
    );
  }
}
