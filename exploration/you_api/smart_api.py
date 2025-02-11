import requests


YOUR_API_KEY = ""

# def get_smart_results(query):
#     headers = {"X-API-Key": YOUR_API_KEY}
#     params = {"query": query, "instructions": instructions}
#     return requests.get(
#         "https://chat-api.you.com/smart?query={query}",
#         params=params,
#         headers=headers,
#     ).json()


import requests

def get_ai_snippets_for_query(query):
    headers = {"X-API-Key": YOUR_API_KEY}
    params = {"query": query}
    return requests.get(
        f"https://api.ydc-index.io/search",
        params=params,
        headers=headers,
    ).json()

results = get_ai_snippets_for_query("latest news in Toronto")
# results = get_research_results("reasons to smile")
# results =  get_search_results("reasons to smile")

print(results)