from langchain_ollama import OllamaLLM
import pprint
from langchain_community.document_loaders import PyPDFLoader
import os

loader = PyPDFLoader("./resources/lecture_slides/week2-lecture-slides.pdf", mode="page")
pages = loader.load_and_split()


docs = loader.load()
print(len(docs))
pprint.pp(docs[0].metadata)

# llm = OllamaLLM(model="llama3-chatqa:8b")

# print(llm.invoke("The first man on the moon was ..."))