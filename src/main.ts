import './style.css';
import app from "./ts/game";
import passSeqs from "./data/passSeq.json";
import { $ } from "./ts/lib/dom";
import { auth, db, provider } from "./ts/lib/firebase";
import { setGameData, setUser, store } from "./ts/redux";


$("#app")!.innerHTML = `
  <nav style="background-color: #444444; margin-bottom: 2rem;">
    <ul
    style="
        font-size: large;
        font-family: 'pixel', sans-serif;
        list-style-type: none;
        display: flex;
        justify-content: space-between;
    ">
      <li style="padding: 1rem">SASTA GUITAR HERO PRO</li>
      
      <li style="padding: 1rem; display: flex">
        <section id="signedOut">
          <div style="display: flex; gap: 2rem; align-items: flex-start">
            <button id="signInBtn">login</button>
          </div>
        </section>

        <section id="signedIn" hidden="true">
          <div style="display: flex; gap: 2rem; align-items: flex-start">
            <div id="userDetails"></div>
            <button id="signOutBtn">logout</button>
          </div>
        </section>
      </li>
    </ul>
  </nav>
<div id="game"></div>
`

$("#game")?.appendChild(app.view);


$("#signInBtn")?.addEventListener("click", () => {
  auth.signInWithPopup(provider)
    .catch(console.error)
});


$("#signOutBtn")?.addEventListener("click", () => {
  auth.signOut()
    .then(() => {
      store.dispatch(setUser({ uid: "" }));
    })
    .catch(console.error)
});


auth.onAuthStateChanged(user => {
  if (user) {
    $("#signedIn")!.hidden = false;
    $("#signedOut")!.hidden = true;
    $("#userDetails")!.innerHTML = `<h3>Hello ${user.displayName}</h3>`;

    // Set the global game features: AUD or VIS
    db.ref("_gamedata").once('value')
      .then((snap) => {
        store.dispatch(setGameData(snap.val()))
        console.log(store.getState().gameData.value);
      });


    const userRef = db.ref(user.uid);
    userRef.once('value')
      .then((snap) => {
        const userData = snap.val();

        if (!userData) {
          if (store.getState().gameData.value.TYPE === "AUTH") {
            alert("Please contact the guys making the game, something is not right.")
            return;
          }

          console.log("[PASS SEQUENCE NOT FOUND]")
          const vals = Object.values(passSeqs)
          const pass = vals[Math.floor(Math.random() * vals.length)]
          userRef.child("passSeq").set(pass);

          store.dispatch(setUser({ ...store.getState().user.value, uid: user.uid, passSeq: pass }));
        } else {
          store.dispatch(setUser({ ...store.getState().user.value, uid: user.uid, passSeq: userData.passSeq }));
          console.log(userData);
          if (userData.noteSpeed && userData.noteGenerateLag) {
            store.dispatch(setUser({ ...store.getState().user.value, noteSpeed: userData.noteSpeed, noteGenerateLag: userData.noteGenerateLag }));
          }
        }
      });

  } else {
    $("#signedIn")!.hidden = true;
    $("#signedOut")!.hidden = false;
    $("#userDetails")!.innerHTML = ``;
  }
});
