class BuildElm {
  static createLabel(labelText = "", label_attr = {}, input_id = null) {
    const label_object = {
      ...label_attr,
      for: input_id || labelText.toLowerCase(),
    };

    return BuildElm.createDOMElement(
      "label",
      labelText != "" ? `${labelText}: ` : "",
      label_object
    );
  }

  static createInput(labelText = "", input_attr = {}) {
    return BuildElm.createDOMElement("input", null, {
      id: labelText.toLowerCase(),
      title: labelText,
      ...input_attr,
    });
  }

  static createDOMElement(type = null, text = null, attr = null) {
    if (type) {
      const element = document.createElement(type);
      if (text) {
        element.innerHTML = text;
      }

      if (attr) {
        Object.entries(attr).forEach(([key, value]) => {
          element.setAttribute(key, value);
        });
      }
      return element;
    }
  }

  static createInputWithLabel(
    labelText = "",
    input_attr = {},
    label_attr = {}
  ) {
    const element = BuildElm.createDOMElement("div");
    const label_elm = BuildElm.createLabel(
      labelText != "" ? labelText : "",
      label_attr,
      input_attr["id"]
    );

    label_elm.appendChild(
      BuildElm.createInput(labelText.toLowerCase(), input_attr)
    );

    element.appendChild(label_elm);
    return element;
  }

  static createRadioBtns(Title, name, radios = []) {
    var div = BuildElm.createDOMElement("div");
    div.appendChild(BuildElm.createDOMElement("p", Title));

    radios.forEach((radio) => {
      var label = BuildElm.createDOMElement("label", radio.title, {
        class: "radio_checkctn",
      });
      var input = BuildElm.createDOMElement("input", null, {
        ...{ type: "radio", name: name },
        ...radio.obj,
      });
      var span = BuildElm.createDOMElement("label", null, {
        class: "checkmark",
      });

      label.appendChild(input);
      label.appendChild(span);
      div.appendChild(label);
    });

    return div;
  }

  static createSelect(labelText = "", select_attr = {}, select_options = []) {
    const select_elm = BuildElm.createDOMElement("select", null, {
      id: labelText.toLowerCase(),
      title: labelText,
      ...select_attr,
    });

    select_options.forEach(function (item, idx) {
      console.log();
      select_elm.appendChild(
        BuildElm.createDOMElement("option", item.text, item.object)
      );
    });

    return select_elm;
  }

  static createSelectWithLabel(
    labelText = "",
    select_attr = {},
    select_options = [],
    label_attr = {}
  ) {
    const element = BuildElm.createDOMElement("div");
    const label_text = labelText != "" ? labelText : "";
    const label_elm = BuildElm.createLabel(
      label_text,
      label_attr,
      select_attr["id"]
    );

    const select_elm = BuildElm.createSelect(
      label_text,
      select_attr,
      select_options
    );

    label_elm.appendChild(select_elm);
    element.appendChild(label_elm);
    return element;
  }
}

class ControlPanel {
  acceptedfiles = ["image/png", "image/jpeg", "image/jpg"];

  constructor(CamDevices) {
    this.CamDevices = CamDevices;
    this.canvasfunc = this.#colorPicked.bind(this);
  }

  #colorPicked(e) {
    if (e.target == this.outputCanvas && this.colorPickerEnabled) {
      this.Screen.color = ColorFunction.getColerRGB(this.outputCtx, e);
      ColorInput.value = this.Screen.color;
    }
  }

  buildControls() {
    var cameras = this.CamDevices.map((camera, idx) => {
      return {
        order: idx + 1,
        text: camera.label,
        object: { value: camera.label, "data-id": camera.deviceId },
      };
    });

    cameras.push({
      order: 0,
      text: "default",
      object: { value: "null", "data-id": "null" },
    });

    this.startbtn = BuildElm.createDOMElement(
      "button",
      !this.isCamStarted ? "Start Cam" : "Stop Cam"
    );

    this.camselector = BuildElm.createSelectWithLabel(
      "cameraSelector",
      { id: "CameraSelector" },
      cameras.sort((a, b) => a.order - b.order),
      { for: "CameraSelector" }
    );

    this.controlSection.appendChild(this.startbtn);
    this.controlSection.appendChild(this.camselector);

    this.controlSection.appendChild(
      BuildElm.createRadioBtns("Select Effect", "cameffect", [
        {
          title: "None",
          obj: { value: "none", checked: "checked", "data-t": "none" },
        },
        {
          title: "Back Screen (green screen)",
          obj: { value: "screen", "data-t": "screen" },
        },
        {
          title: "Blur Screen (blur background)",
          obj: { value: "blur", "data-t": "blur" },
        },
        {
          title: "Image Screen (image background)",
          obj: { value: "image", "data-t": "image" },
        },
      ])
    );
    this.#appendControlEvents();
  }

  #changeEffect(e) {
    this.Effect = e.target.value;

    if (this.Effect == "screen") {
      this.#removeBlurSettings();
      this.#removeImageSettings();
      this.#appendScreenSettings();
    } else if (this.Effect == "blur") {
      this.#removeScreenSettings();
      this.#removeImageSettings();
      this.#appendBlurSettings();
    } else if (this.Effect == "image") {
      this.#removeScreenSettings();
      this.#removeBlurSettings();
      this.#appendImageSettings();
    } else {
      this.#removeImageSettings();
      this.#removeScreenSettings();
      this.#removeBlurSettings();
    }
  }

  #appendControlEvents() {
    this.startbtn.addEventListener("click", this.StartStopCam.bind(this));
    CameraSelector.addEventListener("change", this.#SelectCam.bind(this));

    document.querySelectorAll("input[name='cameffect']").forEach((radio) => {
      radio.addEventListener("click", this.#changeEffect.bind(this));
    });
  }

  #SelectCam(e) {
    var option = CameraSelector.value;
    var CamDevice = this.CamDevices.filter((cam) => cam.label == option);
    this.camState.device = CamDevice[0].deviceId;
    this.contstraints.video.deviceId = CamDevice[0].deviceId;

    if (this.isCamStarted) {
      this.StartCam();
    }
  }

  /** upload Image Settings */
  #appendImageUploader() {
    this.uploadbackscreen = BuildElm.createDOMElement("input", null, {
      type: "file",
      accept: this.acceptedfiles
        .map((accept, i) => {
          return accept;
        })
        .join(),
    });
  }

  #appendImageUploaderEvent() {
    this.uploadbackscreen.addEventListener(
      "change",
      this.#uploadBackImg.bind(this)
    );
  }

  #removeImageUploader() {
    this.uploadbackscreen.removeEventListener("change", this.#uploadBackImg);
  }
  /** upload Image Settings */

  /** Foreground Settings */
  #removeFrontTresholdEvent() {
    if (FrontThreshold != undefined) {
      FrontThreshold.removeEventListener("change", this.#changeFrontThreshold);
    }
  }

  #addFrontTresholdEvent() {
    if (typeof FrontThreshold != undefined) {
      FrontThreshold.addEventListener(
        "change",
        this.#changeFrontThreshold.bind(this)
      );
    }
  }

  #appendFrontTreshold() {
    this.FrontThreshold = BuildElm.createInputWithLabel(
      "Foreground Threshold",
      {
        id: "FrontThreshold",
        type: "range",
        min: 0,
        max: 1,
        step: 0.1,
        value: this.visualization.foregroundThreshold,
      },
      { for: "FrontThreshold" }
    );
  }

  #changeFrontThreshold(e) {
    this.visualization.foregroundThreshold = FrontThreshold.value;
  }
  /** Foreground Settings */

  /** Image Settings */
  #appendImageSettings() {
    this.imagesettingdiv = BuildElm.createDOMElement("div", null, {
      "data-t": "imagesettings",
    });

    this.#appendImageUploader();
    this.#appendFrontTreshold();

    this.maskBlur = BuildElm.createInputWithLabel(
      "Mask Blur",
      {
        id: "MaskBlur",
        type: "range",
        min: 0,
        max: 20,
        step: 1,
        value: this.visualization.maskBlur,
      },
      { for: "MaskBlur" }
    );

    this.maskOpacity = BuildElm.createInputWithLabel(
      "Mask Opacity",
      {
        id: "MaskOpacity",
        type: "range",
        min: 0,
        max: 1,
        step: 0.1,
        value: this.visualization.maskOpacity,
      },
      { for: "MaskOpacity" }
    );

    this.controlSection.appendChild(this.imagesettingdiv);
    this.imagesettingdiv.appendChild(this.uploadbackscreen);
    this.imagesettingdiv.appendChild(this.FrontThreshold);
    this.imagesettingdiv.appendChild(this.maskBlur);
    this.imagesettingdiv.appendChild(this.maskOpacity);
    this.#appendImageEvent();
  }

  #appendImageEvent() {
    this.#appendImageUploaderEvent();
    this.#addFrontTresholdEvent();
    MaskBlur.addEventListener("change", this.#changeMaskBlur.bind(this));
    MaskOpacity.addEventListener("change", this.#changeMaskOp.bind(this));
  }

  #changeMaskOp(e) {
    this.visualization.maskOpacity = MaskOpacity.value;
  }

  #changeMaskBlur(e) {
    this.visualization.maskBlur = MaskBlur.value;
  }

  #removeImageSettings() {
    if (this.imagesettingdiv) {
      if (MaskBlur != undefined) {
        MaskBlur.removeEventListener("change", this.#changeMaskBlur);
      }
      if (MaskOpacity != undefined) {
        MaskOpacity.removeEventListener("change", this.#changeMaskOp);
      }
      this.#removeImageUploader();
      this.#removeFrontTresholdEvent();
      this.imagesettingdiv.remove();
      this.imagesettingdiv = null;
    }
  }

  #uploadBackImg(e) {
    var file = e.target.files[0];
    if (this.acceptedfiles.includes(file.type)) {
      this.#ReadImageFile(file);
    }
  }
  /** Image Settings */

  /** Blur Settings  */
  #appendBlurSettings() {
    this.blursettingdiv = BuildElm.createDOMElement("div", null, {
      "data-t": "blursettings",
    });

    this.backBlur = BuildElm.createInputWithLabel(
      "Background Blur",
      {
        id: "BackBlur",
        type: "range",
        min: 0,
        max: 20,
        step: 1,
        value: this.visualization.backgroundBlur,
      },
      { for: "BackBlur" }
    );

    this.edgeBlur = BuildElm.createInputWithLabel(
      "Edge Blur",
      {
        id: "EdgeBlur",
        type: "range",
        min: 0,
        max: 20,
        step: 1,
        value: this.visualization.edgeBlur,
      },
      { for: "EdgeBlur" }
    );
    this.#appendFrontTreshold();

    this.controlSection.appendChild(this.blursettingdiv);
    this.blursettingdiv.appendChild(this.backBlur);
    this.blursettingdiv.appendChild(this.edgeBlur);
    this.blursettingdiv.appendChild(this.FrontThreshold);

    this.#appendBlurEvent();
  }

  #removeBlurSettings() {
    if (this.blursettingdiv) {
      this.#removeFrontTresholdEvent();
      if (EdgeBlur != undefined) {
        EdgeBlur.removeEventListener("change", this.#changeBlurEdge);
      }
      if (BackBlur != undefined) {
        BackBlur.removeEventListener("change", this.#changeBlurBack);
      }

      this.blursettingdiv.remove();
      this.blursettingdiv = null;
    }
  }

  #appendBlurEvent() {
    BackBlur.addEventListener("change", this.#changeBlurBack.bind(this));
    EdgeBlur.addEventListener("change", this.#changeBlurEdge.bind(this));
    this.#addFrontTresholdEvent();
  }

  #changeBlurBack(e) {
    this.visualization.backgroundBlur = BackBlur.value;
  }

  #changeBlurEdge(e) {
    this.visualization.edgeBlur = EdgeBlur.value;
  }
  /** Blur Settings  */

  /** Screen Settings  */
  #appendScreenSettings() {
    this.screensettingdiv = BuildElm.createDOMElement("div", null, {
      "data-t": "sceensettings",
    });

    this.#appendImageUploader();

    this.colorInput = BuildElm.createInputWithLabel(
      "Color Seletor",

      {
        id: "ColorInput",
        type: "color",
        value: this.Screen.color,
      },
      {
        for: "ColorInput",
      }
    );

    this.thresholdInput = BuildElm.createInputWithLabel(
      "Threshold",
      {
        id: "ThresholdInput",
        type: "range",
        min: 0,
        max: 255,
        value: this.Screen.threshold,
      },
      { for: "ThresholdInput" }
    );

    this.startPickerbtn = BuildElm.createDOMElement(
      "button",
      !this.colorPickerEnabled ? "Enable Color Picker" : "Disable Color Picker"
    );

    this.controlSection.appendChild(this.screensettingdiv);
    this.colorInput.appendChild(this.startPickerbtn);
    this.screensettingdiv.appendChild(this.uploadbackscreen);
    this.screensettingdiv.appendChild(this.colorInput);
    this.screensettingdiv.appendChild(this.thresholdInput);

    this.#ScreenSettingsEvents();
  }

  #removeScreenSettings() {
    if (this.screensettingdiv) {
      this.#removeImageUploader();
      if (ThresholdInput != undefined) {
        ThresholdInput.removeEventListener("change", this.#changeThreshold);
      }
      if (ColorInput != undefined) {
        ColorInput.removeEventListener("change", this.#changeColor);
      }
      this.startPickerbtn.removeEventListener("click", this.#StartStopPicker);
      this.screensettingdiv.remove();
      this.colorPickerEnabled = false;
      this.#colorPickerEvent();
      this.screensettingdiv = null;
    }
  }

  #ScreenSettingsEvents() {
    this.#appendImageUploaderEvent();
    ThresholdInput.addEventListener("change", this.#changeThreshold.bind(this));
    ColorInput.addEventListener("input", this.#changeColor.bind(this));
    this.startPickerbtn.addEventListener(
      "click",
      this.#StartStopPicker.bind(this)
    );
  }

  #StartStopPicker(e) {
    this.colorPickerEnabled = !this.colorPickerEnabled;
    this.startPickerbtn.innerHTML = !this.colorPickerEnabled
      ? "Enable Color Picker"
      : "Disable Color Picker";
    this.#colorPickerEvent();
  }

  #colorPickerEvent() {
    if (this.colorPickerEnabled) {
      this.outputCanvas.addEventListener("click", this.canvasfunc);
    } else {
      this.outputCanvas.removeEventListener("click", this.canvasfunc);
    }
  }

  #changeColor(e) {
    this.Screen.color = e.target.value;
  }

  #changeThreshold(e) {
    this.Screen.threshold = e.target.value;
  }
  /** Screen Settings  */

  #ReadImageFile(file) {
    var _ = this;
    var reader = new FileReader();
    reader.onload = function (evt) {
      _.BackgoundImage = evt.target.result;
    };

    reader.readAsDataURL(file);
  }
}

class WebCam extends ControlPanel {
  camState = {
    fps: 60,
    size: "640 X 480",
    device: "",
    mode: "model",
  };

  videoSize = {
    "640 X 480": {
      w: 640,
      h: 480,
    },
    "640 X 360": {
      w: 640,
      h: 360,
    },
    "360 X 270": {
      w: 360,
      h: 270,
    },
  };

  contstraints = {
    video: {
      deviceId: this.camState.device,
      width: (0, DeviceDetector.isMobile)()
        ? this.videoSize["360 X 270"].w
        : this.videoSize[this.camState.size].w,
      height: (0, DeviceDetector.isMobile)()
        ? this.videoSize["360 X 270"].h
        : this.videoSize[this.camState.size].h,
      frameRate: { ideal: this.camState.fps },
      audio: false,
    },
  };

  Screen = {
    color: "#000000",
    threshold: 90,
  };

  visualization = {
    foregroundThreshold: 0.5,
    maskOpacity: 0,
    maskBlur: 0,
    backgroundBlur: 3,
    edgeBlur: 3,
  };

  isCamStarted = false;
  Effect = "none";
  BackgoundImage = null;
  colorPickerEnabled = false;

  constructor(CamDevices) {
    super(CamDevices);

    this.controlSection = document.getElementById("controls_ctn");
    this.video = BuildElm.createDOMElement("video");
    this.outputCanvas = document.getElementById("video-output");

    this.outputCtx = this.outputCanvas.getContext("2d", {
      willReadFrequently: true,
    });
  }

  StartStopCam(e) {
    this.isCamStarted = !this.isCamStarted;

    this.startbtn.innerHTML = !this.isCamStarted ? "Start Cam" : "Stop Cam";
    this.StartCam();
  }

  #buildCanvas() {
    this.outputCanvas.width = this.width;
    this.outputCanvas.height = this.height;
  }

  #buildVideo() {
    this.video.srcObject = this.stream;

    this.video.onloadedmetadata = async () => {
      this.video.play();
      await this.#draw();
    };
  }

  async #setupCam() {
    if (!this.net)
      this.net = await bodySegmentation.createSegmenter(
        bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation,
        {
          runtime: "mediapipe",
          solutionPath:
            "https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation",
          modelType: "general",
        }
      );
    this.stream = await navigator.mediaDevices.getUserMedia(this.contstraints);
    const [track] = this.stream.getVideoTracks();
    this.videoStreamTrack = track;
    const { width, height } = track.getSettings();
    this.width = width;
    this.height = height;
    this.video.style.width = this.width + "px";
    this.video.style.height = this.height + "px";
  }

  async init() {
    this.buildControls();
    await this.StartCam();
  }

  async StartCam() {
    if (this.isCamStarted && this.camState.device != "") {
      await this.#setupCam();
      this.#buildCanvas();
      this.#buildVideo();
    } else {
      this.#StopCam();
    }
  }

  #StopCam() {
    if (this.stream) {
      // Stop all tracks in the stream
      this.stream.getTracks().forEach((track) => track.stop());
      this.video.pause();
      this.video.srcObject = null; // Clear the video source
      setTimeout(() => {
        this.outputCtx.clearRect(0, 0, this.width, this.height);
      }, 150);
    }
  }

  async #draw() {
    if (this.video.paused || this.video.ended) {
      return;
    }

    switch (this.Effect) {
      case "screen":
        await this.#computeScreenFrame();
        break;
      case "blur":
        await this.#computeBlurFrame();
        break;
      case "image":
        await this.#computeImageFrame();
        break;
      default:
        this.outputCtx.drawImage(this.video, 0, 0, this.width, this.height);
    }

    requestAnimationFrame(async () => await this.#draw());
  }

  async #computeScreenFrame() {
    if (this.BackgoundImage && this.isCamStarted) {
      const img = new Image();
      img.src = this.BackgoundImage;

      img.onload = async (e) => {
        this.outputCtx.globalCompositeOperation = "source-in";
        this.outputCtx.drawImage(img, 0, 0, this.width, this.height);
        this.#ChormaVideo();
        this.outputCtx.globalCompositeOperation = "destination-over";
        this.outputCtx.drawImage(img, 0, 0, this.width, this.height);
      };
    } else if (this.isCamStarted) {
      this.#ChormaVideo();
    }
  }

  #ChormaVideo() {
    const frame = this.#buildOffscreenCanvas();
    const newframe = ColorFunction.Chroma(
      frame,
      this.Screen.threshold,
      this.Screen.color
    );

    this.outputCtx.putImageData(newframe, 0, 0);
  }

  async #SegmentPeople() {
    const segmentation = await this.net.segmentPeople(this.video, {
      flipHorizontal: false,
      multiSegmentation: false,
      segmentBodyParts: true,
      segmentationThreshold: this.visualization.foregroundThreshold,
    });

    console.log(segmentation);

    return segmentation;
  }

  async #computeImageFrame() {
    if (this.BackgoundImage && this.isCamStarted) {
      const img = new Image();
      img.src = this.BackgoundImage;

      img.onload = async (e) => {
        const segmentation = await this.#SegmentPeople();
        const foregroundMask = await bodySegmentation.toBinaryMask(
          segmentation,
          { r: 0, g: 0, b: 0, a: 0 }, // Threshold for separating foreground
          { r: 0, g: 0, b: 0, a: 255 }, // Threshold for separating background
          false,
          this.visualization.foregroundThreshold
        );

        const tempCanvas = new OffscreenCanvas(this.width, this.height);
        const tempCtx = tempCanvas.getContext("2d");

        // Apply blur to the background
        tempCtx.globalCompositeOperation = "source-in";
        tempCtx.putImageData(foregroundMask, 0, 0);
        tempCtx.drawImage(img, 0, 0, this.width, this.height);

        await bodySegmentation.drawMask(
          this.outputCanvas,
          tempCanvas,
          foregroundMask,
          this.visualization.maskOpacity, // Mask opacity
          this.visualization.maskBlur, // No background blur since we are replacing the background with an image
          false // Flip the mask horizontally to match the camera
        );

        this.outputCtx.globalCompositeOperation = "destination-over";
        this.outputCtx.drawImage(this.video, 0, 0, this.width, this.height);
      };
    } else if (this.isCamStarted) {
      this.outputCtx.drawImage(this.video, 0, 0, this.width, this.height);
    }
  }

  async #computeBlurFrame() {
    if (this.isCamStarted) {
      const segmentation = await this.#SegmentPeople();

      await bodySegmentation.drawBokehEffect(
        this.outputCanvas,
        this.video,
        segmentation,
        this.visualization.foregroundThreshold,
        this.visualization.backgroundBlur, // Background blur radius
        this.visualization.edgeBlur, // Edge blur radius
        false
      );
    }
  }

  #buildOffscreenCanvas() {
    const processCanvas = new OffscreenCanvas(this.width, this.height);
    const processCtx = processCanvas.getContext("2d");

    processCtx.drawImage(this.video, 0, 0, this.width, this.height);
    const frame = processCtx.getImageData(0, 0, this.width, this.height);

    return frame;
  }
}

class ColorFunction {
  static NumberToHex(number) {
    if (number < 0 && number > 255) {
      throw new Error("Value must be a number between 0 and 255.");
    }
    // Convert to 8-bit value and to hex
    let hex = number.toString(16);
    // Ensure it's two characters long
    return hex.padStart(2, "0").toString();
  }

  static HexToRGB(hex) {
    return {
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16),
    };
  }

  static getColerRGB(ctx, { offsetX, offsetY }) {
    const [r, g, b, a] = ctx.getImageData(offsetX, offsetY, 1, 1).data;

    return (
      "#" +
      ColorFunction.NumberToHex(r) +
      ColorFunction.NumberToHex(g) +
      ColorFunction.NumberToHex(b)
    );
  }

  static Chroma(frame, threshold, colorHEX = "#000000") {
    const color = ColorFunction.HexToRGB(colorHEX);

    for (let i = 0; i < frame.data.length; i += 4) {
      const r = frame.data[i];
      const g = frame.data[i + 1];
      const b = frame.data[i + 2];

      if (
        Math.abs(r - color.r) < threshold &&
        Math.abs(g - color.g) < threshold &&
        Math.abs(b - color.b) < threshold
      ) {
        frame.data[i + 3] = 0;
      }
    }

    return frame;
  }
}

class DeviceDetector {
  static isiOS() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  static isAndroid() {
    return /Android/i.test(navigator.userAgent);
  }

  static isMobile() {
    return DeviceDetector.isAndroid() || DeviceDetector.isiOS();
  }

  static async getVideoInputs() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.log("enumerateDevices() not supported.");
      return [];
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(
      (device) => device.kind === "videoinput"
    );
    return videoDevices;
  }
}

(async () => {
  var CamDevices = await DeviceDetector.getVideoInputs();
  var webcam = new WebCam(CamDevices);
  await webcam.init();
})();
