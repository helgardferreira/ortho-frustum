import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";

export class Viewer {
  private orthoFrustumSize = 10;
  private ortho: THREE.OrthographicCamera;
  private orthoFrustum: THREE.Frustum;
  private perspective: THREE.PerspectiveCamera;
  private orthoHelper: THREE.CameraHelper;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private controls: OrbitControls;

  private gui?: dat.GUI;
  private debug = true;
  private cube?: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>;
  private isObjectInFrustum: boolean = false;

  constructor() {
    const aspectRatio = window.innerWidth / window.innerHeight;
    this.ortho = new THREE.OrthographicCamera(
      (aspectRatio * this.orthoFrustumSize) / -2,
      (aspectRatio * this.orthoFrustumSize) / 2,
      this.orthoFrustumSize / 2,
      this.orthoFrustumSize / -2,
      0.1,
      100
    );
    this.ortho.position.set(0, 0, 1);
    this.orthoHelper = new THREE.CameraHelper(this.ortho);
    this.orthoFrustum = new THREE.Frustum();
    this.orthoFrustum.setFromProjectionMatrix(
      new THREE.Matrix4().multiplyMatrices(
        this.ortho.projectionMatrix,
        this.ortho.matrixWorldInverse
      )
    );

    this.perspective = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    this.perspective.position.set(2, 2, 6);
    this.perspective.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.controls = new OrbitControls(this.perspective, this.canvas);

    this.scene = new THREE.Scene();

    this.scene.add(this.ortho);
    this.scene.add(this.orthoHelper);

    if (this.debug) {
      this.gui = new dat.GUI();
    }

    this.init();
    this.render();
  }

  public get canvas() {
    return this.renderer.domElement;
  }

  private init = () => {
    this.createObjects();
    this.addDebugGui();
    this.addEvents();
  };

  private addDebugGui = () => {
    if (this.gui) {
      const cameraGui = this.gui.addFolder("Cameras");
      cameraGui.closed = false;
      const orthoGui = cameraGui.addFolder("Orthographic");
      orthoGui.closed = false;
      const perspectiveGui = cameraGui.addFolder("Perspective");
      perspectiveGui.closed = false;
      orthoGui.add(this.ortho.position, "x").min(-50).max(50);
      orthoGui.add(this.ortho.position, "y").min(-50).max(50);
      orthoGui.add(this.ortho.position, "z").min(-50).max(50);

      perspectiveGui.add(this.perspective.position, "x").min(-50).max(50);
      perspectiveGui.add(this.perspective.position, "y").min(-50).max(50);
      perspectiveGui.add(this.perspective.position, "z").min(-50).max(50);
    }
  };

  private createObjects = () => {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial();
    this.cube = new THREE.Mesh(geometry, material);
    this.scene.add(this.cube);

    this.isObjectInFrustum = this.orthoFrustum.intersectsObject(this.cube);
  };

  private addEvents = () => {
    window.addEventListener("resize", this.resizeCanvas);
  };

  private resizeCanvas = () => {
    const aspectRatio = window.innerWidth / window.innerHeight;
    // Update camera
    this.perspective.aspect = aspectRatio;
    this.perspective.updateProjectionMatrix();
    this.ortho.left = (this.orthoFrustumSize * aspectRatio) / -2;
    this.ortho.right = (this.orthoFrustumSize * aspectRatio) / 2;
    this.ortho.top = this.orthoFrustumSize / 2;
    this.ortho.bottom = this.orthoFrustumSize / -2;
    this.ortho.updateProjectionMatrix();
    this.orthoHelper.update();

    // Update renderer
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };

  private render = () => {
    this.renderer.render(this.scene, this.perspective);
    this.controls.update();

    this.orthoFrustum.setFromProjectionMatrix(
      new THREE.Matrix4().multiplyMatrices(
        this.ortho.projectionMatrix,
        this.ortho.matrixWorldInverse
      )
    );
    if (this.cube) {
      const isObjectInFrustum = this.orthoFrustum.intersectsObject(this.cube);
      if (this.isObjectInFrustum !== isObjectInFrustum) {
        this.isObjectInFrustum = isObjectInFrustum;
        console.log(isObjectInFrustum);
      }
    }

    requestAnimationFrame(this.render);
  };

  private dispose = () => {
    window.removeEventListener("resize", this.resizeCanvas);
  };
}

const viewer = new Viewer();
export default viewer;
