export default function authentificate(): boolean {
    const token = localStorage.getItem("authToken");

    fetch("http://localhost:8000/users/protected-resource/", {
        method: "GET",
        headers: {
            "Authorization": `Token ${token}`
        }
    })
        .then(res => {
            if (res.status === 401) {
                console.error("Unauthorized — maybe user must login again");
            }
            const data = res.json
        })
        .then(data => console.log("Protected data:", data));
    return false
}