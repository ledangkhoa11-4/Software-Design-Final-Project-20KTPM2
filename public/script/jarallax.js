// let zaamin = document.getElementById("zaamin");
// let stone = document.getElementById("stone");
// let bottom_cloud = document.getElementById("bottom_cloud");
// let left_cloud = document.getElementById("left_cloud");
// let moon = document.getElementById("moon");
let right_cloud = document.getElementById("right_cloud");
let text = document.getElementById("text");
let stars = document.getElementById("stars");

window.addEventListener("scroll", function () {
  let val = window.scrollY;
  let responsive = window.innerWidth;

//   stone.style.transform = "translateY(" + val * 0.1 + "px)";
//   moon.style.transform = "translateX(" + val * -0.3 + "px)";
//   left_cloud.style.transform = "translateX(" + val * -0.3 + "px)";
   right_cloud.style.transform = "translateX(" + val * 1.3 + "px)";
//   bottom_cloud.style.transform = "translateX(" + val * 0.8 + "px)";
  stars.style.transform = "translateY(" + val * -1 + "px)";
  text.style.transform = "translateY(" + val * 2 + "px)";

  if (responsive <= 768) {
    text.style.transform = "scale(" + 0.7 + ") translateY(" + val * 1 + "px)";
  }
  if (responsive <= 576) {
    text.style.transform = "scale(" + 0.5 + ") translateY(" + val * 1 + "px)";
  }
});
