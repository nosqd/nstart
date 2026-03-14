<script lang="ts">
    let query = $state("");
    let bookmarks = $state<
        { _id: string; url: string; name: string; icon?: string }[]
    >([]);
    let ipinfoPromise = $state(loadIpInfo());

    async function loadIpInfo() {
        const res = await (
            await fetch("https://ip.nosqd.dev", {
                headers: { Accept: "application/json" },
            })
        ).json();
        return res;
    }
    setInterval(() => {
        ipinfoPromise = loadIpInfo();
    }, 5000);

    async function loadBookmarks() {
        try {
            const res = await fetch("http://localhost:8787/bookmarks");
            bookmarks = await res.json();
        } catch (e) {
            console.error(e);
        }
    }

    loadBookmarks();

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Enter" && query.trim()) {
            window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        }
    }

    async function addBookmark() {
        const url = window.prompt("Enter URL:");
        if (!url) return;
        const name = window.prompt("Enter name:");
        if (!name) return;
        const icon = window.prompt(
            "Enter icon name (optional, e.g., github, youtube, twitter):",
        );
        try {
            await fetch("http://localhost:8787/bookmarks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url, name, icon }),
            });
            loadBookmarks();
        } catch (e) {
            console.error(e);
        }
    }
    // @ts-ignore
    window.addBookmark = addBookmark;
</script>

<main>
    <div class="ip-info">
        {#await ipinfoPromise}
            <p>Loading...</p>
        {:then value}
            <p>{value.flag} {value.country} @ {value.asn_org}</p>
        {:catch error}
            <p>Failed to load IP Info: {error.message}</p>
        {/await}
    </div>
    <div class="pivot-container">
        <div class="greeting">
            Welcome, <span class="accent">nosqd</span>!
        </div>

        <input
            type="text"
            bind:value={query}
            onkeydown={handleKeydown}
            placeholder="Search Google..."
            autocomplete="off"
            autofocus
        />

        <div class="bookmarks-grid">
            {#each bookmarks as bm (bm._id)}
                <div class="bookmark-item">
                    <a
                        href={bm.url.startsWith("http")
                            ? bm.url
                            : `https://${bm.url}`}
                        class="bookmark-link"
                    >
                        <div class="bm-icon">
                            <img
                                src={`https://www.google.com/s2/favicons?domain=${bm.url}&sz=32`}
                                alt=""
                            />
                        </div>
                        <span class="bm-name">{bm.name}</span>
                    </a>
                </div>
            {/each}
        </div>
    </div>
</main>

<style>
    :global(*) {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    .ip-info {
        width: 100vw;
        display: flex;
        justify-content: center;
        font-size: 16px;
        margin-top: 8px;
    }
    .pivot-container {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
        max-width: 750px;
        padding: 0 20px;
    }
    .greeting {
        position: absolute;
        bottom: 100%;
        left: 0;
        width: 100%;
        text-align: center;
        font-size: 1.75rem;
        margin-bottom: 1.5rem;
    }
    .accent {
        color: #fabd2f;
    }
    input {
        width: 100%;
        height: 48px;
        border-radius: 16px;
        background: #282828;
        color: #ebdbb2;
        border: 1px solid #3c3836;
        font-family: inherit;
        font-size: 1.25rem;
        padding: 0 1.75rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
        transition: all 0.2s ease;
    }
    input::placeholder {
        color: #928374;
        font-size: 1.25rem;
    }
    input:hover {
        background: #32302f;
        border-color: #504945;
    }
    input:focus {
        outline: none;
        background: #32302f;
        border-color: #504945;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
    }
    .bookmarks-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 20px;
        justify-content: center;
    }
    .bookmark-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        min-width: 76px;
        min-height: 76px;
    }
    .bookmark-link {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 12px;
        background: #282828;
        border: 1px solid #3c3836;
        border-radius: 8px;
        color: #ebdbb2;
        text-decoration: none;
        transition: all 0.2s;
        min-width: 76px;
        min-height: 76px;
    }
    .bookmark-link:hover {
        background: #32302f;
        border-color: #504945;
    }
    .bm-icon img {
        width: 24px;
        height: 24px;
        border-radius: 4px;
    }
    .bm-name {
        font-size: 0.625rem;
        text-transform: lowercase;
        opacity: 0.7;
    }
</style>
