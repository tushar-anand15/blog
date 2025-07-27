# Transformers from scratch: Data preparation and word embeddings

# Introduction

Transformer models, first introduced in the seminal paper "Attention is All You Need" by Vaswamy et al., revolutionized the field of natural language processing. The architecture replaced the traditional recurrent neural networks with a novel self-attention mechanism, allowing the model to process input sequences in parallel and capture long-range dependencies more effectively.

The key innovation of transformers is their ability to weigh the importance of different parts of the input sequence when processing each element, done through the self-attention mechanism. This, combined with their parallel processing capability, made them significantly more efficient to train than previous architectures while achieving superior performance on various NLP tasks.

In this project, I'm implementing a simplified version of the GPT (Generative Pre-trained Transformer) architecture, which is an auto-regressive language model based on the decoder portion of the original transformer. In this article, I've focused on the fundamental data preparation steps needed before training the model. This includes tokenization (converting text into numerical representations), creating input-target pairs for training, and implementing both token and positional embeddings - essential components that allow the model to understand both the meaning of words and their position in a sequence. All the associated code with this project can be found [here](https://github.com/tushar-anand15/transformers-from-scratch).

## Tokenization

Tokenization is the process of breaking down text into smaller units called tokens. These tokens can be words, subwords, or even individual characters. The choice of tokenization strategy significantly impacts the model's vocabulary size and its ability to handle unseen words.

### Word-Level Tokenization

The simplest approach is to split text on whitespace and punctuation. For example, "Hello, world!" becomes ["Hello", ",", "world", "!"]. While straightforward, this approach can lead to large vocabularies and struggles with morphological variations of words.

### Subword Tokenization

Modern transformer models often use subword tokenization algorithms like BPE (Byte-Pair Encoding) or WordPiece. These methods break down less common words into smaller units. For example, "unconditional" might become ["un", "condition", "al"].

### Handling Unknown Tokens

When encountering words not in the vocabulary, tokenizers typically:

- Use a special [UNK] token to represent unknown words
- Break down unknown words into known subword units
- Use byte-level fallback to ensure any text can be encoded

This approach allows models to handle out-of-vocabulary words while maintaining a reasonable vocabulary size.

### How tokenization looks like in practice: encoding and decoding

To create a simple tokenizer, we can use our corpus of text to get the unique words and sort them to get a vocabulary. This vocabulary can be used as input for our custom tokenizer which can encode and decode text sequences. The vocabulary dictionary shows a small sample of the word-to-token mappings:

```python
vocabulary = {
    'a': 1,
    'aa': 2,
    'aaa': 3,
    'aaawww': 4,
    'aah': 5,
    'aaron': 6,
    'ab': 7,
    'aback': 8,
    'abandon': 9,
    'abandoned': 10,
    'abandoning': 11,
    'abandonment': 12,
    'abaringe': 13,
    'abasement': 14
}
```

A simple example of what a encoding and decoding looks like:

```python
# Input sentence
sentence = "This is a sample sentence to demonstrate the encoding and decoding process."

# Create tokenizer instance
custom_tokenizer = CustomTokenizer(vocabulary)

# Encode the sentence into token IDs
encoded = custom_tokenizer.encode(sentence)
print(encoded)
# Output: [36063, 19043, 1, 31001, 31796, 36383, 9451, 35902, 0, 1342, 0, 0]

# Decode the token IDs back to text
decoded = custom_tokenizer.decode(encoded)
print(decoded)
# Output: 'this is a sample sentence to demonstrate the <UNK> and <UNK> <UNK>'
```

**Important takeaways:**

- The input sentence is first converted into a sequence of numerical token IDs using the encode() method
- Each word is mapped to a unique ID based on the vocabulary dictionaryWords not found in the vocabulary (like "process") are replaced withtokens (represented by 0 in the encoded sequence)
- The decode() method converts the numerical tokens back to text, showing how information can be lost when words are not in the vocabulary

### More intelligent tokenization: Byte Pair Encoding

Byte Pair Encoding (BPE) is a data compression technique adapted for tokenization in NLP. It starts with character-level tokens and iteratively merges the most frequent pairs of adjacent tokens to create new subword tokens. This approach helps balance vocabulary size with the model's ability to handle rare and unknown words.

For example, consider how BPE might handle words with common suffixes:

```python
tokenizer = CustomTokenizer(vocabulary)

# Sample text
sentence = "the quick brown fox jumps over the lazy dog"

# Encode the text using BPE
encoded_bpe = tokenizer.encode_bpe(sentence.lower(), token_dict)
print("Encoded BPE:", encoded_bpe)

# Decode the BPE tokens back to text
decoded_bpe = tokenizer.decode_bpe(encoded_bpe, token_dict)
print("Decoded Text:", decoded_bpe)

# Output:
# Encoded BPE: [35902, 28498, 4614, 14215, 19484, 25139, 35902, 20330, 10654]
# Decoded Text: the quick brown fox jumps over the lazy dog
```

In this example, each word is represented by a unique token ID. A more detailed explanation of BPE and its implementation can be found in the HuggingFace documentation [here](https://huggingface.co/learn/nlp-course/chapter6/5). 

The key advantage of BPE is that it can handle out-of-vocabulary words by breaking them down into meaningful subword units, making it more robust than simple word-level tokenization.

## Understanding word embeddings

Word embeddings are numerical representations of words that capture semantic relationships in a high-dimensional vector space. Unlike simple one-hot encoding where each word is represented as a binary vector, word embeddings create dense vectors where similar words have similar vector representations.

### How Computers Process Text

Computers fundamentally work with numbers, not text. To process language, we need to convert words into numerical representations that preserve meaningful relationships. This is where embeddings come in - they transform discrete symbols (words, sentences, or even entire documents) into continuous vector spaces where mathematical operations become meaningful.

### Types of Embeddings

### 1. Word Embeddings

Word embeddings (like Word2Vec, GloVe, or FastText) represent individual words as dense vectors. These are useful for basic text classification tasks, word similarity comparisons and simple language understanding tasks.

![An example of how word embeddings look like in practice. When an embedding model is trained, the intuition is that the model hopefully learns the relationship between the words and learns to represent these relationships in vector space. The relationship between a man and a woman is the same as the relationship between a king and queen — which can be seen graphically and mathematically. Credits: 3Blue1Brown (YT link: [https://www.youtube.com/watch?v=wjZofJX0v4M](https://www.youtube.com/watch?v=wjZofJX0v4M))](./articles/image.png)

An example of how word embeddings look like in practice. When an embedding model is trained, the intuition is that the model hopefully learns the relationship between the words and learns to represent these relationships in vector space. The relationship between a man and a woman is the same as the relationship between a king and queen — which can be seen graphically and mathematically. Image credits: : [3Blue1Brown](https://www.youtube.com/watch?v=wjZofJX0v4M))

### 2. Sentence Embeddings

Sentence embeddings capture meaning at the sentence level, going beyond individual words. Examples include Universal Sentence Encoder and SBERT. Use cases include: semantic search, sentence similarity comparison and question answering systems

### 3. Paragraph/Document Embeddings

These embeddings represent entire documents or paragraphs (like Doc2Vec). They're particularly useful for: document classification, content recommendation systems, document clustering and retrieval augmented generation (RAG),

## Preparing data for embedding: Pytorch Dataset and Dataloader

When working with text data in deep learning, we need efficient ways to handle and process large amounts of text. PyTorch's Dataset and DataLoader classes provide this functionality, allowing us to create custom datasets and load them in batches for training.

### Creating Training Samples

To prepare text data for training, we need to convert it into input-target pairs. This is done by sliding a window over the text with a specified stride length. For example, with a context length of 8 and a stride of 4:

```python
# Original text: "The quick brown fox jumps over the lazy dog"
# Tokenized: [1, 2, 3, 4, 5, 6, 7, 8, 9]

# First sample:
# Input:  [1, 2, 3, 4, 5, 6, 7, 8]
# Target: [2, 3, 4, 5, 6, 7, 8, 9]

# Second sample (stride = 4):
# Input:  [5, 6, 7, 8, 9, 10, 11, 12]
# Target: [6, 7, 8, 9, 10, 11, 12, 13]
```

The key insight is that each target sequence is simply the input sequence shifted by one position. This creates a next-token prediction task where the model learns to predict the next token given the previous tokens as context.

### Batching and DataLoader

The DataLoader combines multiple samples into batches, making training more efficient. It handles:

- Shuffling the data for each epoch
- Combining multiple sequences into batches
- Loading data in parallel using multiple workers
- Applying padding if necessary to ensure all sequences in a batch have the same length

This batched approach allows the model to process multiple sequences simultaneously, significantly speeding up training while maintaining the autoregressive nature of the task - each position can only attend to previous positions in the sequence. I use the Dataloader from Pytorch for ease of processing the data.

Our embedding model is configured with the following parameters:

- **Batch Size**: 4
- **Max Length**: 256
- **Stride**: 128
- **Output Dimension**: 256
- **Vocabulary Length**: Determined dynamically based on the text corpus

These parameters guide how we process text data and generate embeddings.

## Tokenization with Tiktoken

From hereon, I utilize the `TiktokenTokenizer`, which implements Byte Pair Encoding (BPE), to tokenize our text. This choice is made for its efficiency and ease of use compared to our native implementation.

```python
tiktoken_tokenizer = TiktokenTokenizer()
encoded_text = tiktoken_tokenizer.encode(text)
print("Tiktoken Tokenizer Encoding:", encoded_text[:10])  # Print first 10 tokens for brevity
```

### Example Output

For the text snippet "The Fulton", the tokenizer produces the following encoded output:

```
Tiktoken Tokenizer Encoding: [464, 44373, 3418, 5675, 48705, 531, 3217, 281, 3645, 286]
```

This output represents the tokenized form of the text, where each number corresponds to a token in the vocabulary.

## Batching and DataLoader

The DataLoader is responsible for creating batches of data that are fed into the model. It uses the `batch_size`, `max_length`, and `stride` parameters to generate overlapping sequences of tokens.

```python
for batch in dataloader:
    input_ids, target_ids = batch
    print("Batch from DataLoader (input_ids):", input_ids)
```

### Explanation

- **Batch Size**: Determines how many sequences are processed together in one forward pass.
- **Max Length**: Specifies the maximum length of each sequence.
- **Stride**: Controls the overlap between consecutive sequences, allowing the model to capture context across batches.

## Creating the Embedding Layer

The embedding layer is created using PyTorch's `nn.Embedding`, which maps token indices to dense vectors of a specified dimension.

```python
embedding_layer = WordEmbeddingLayer(vocab_length, output_dim)
```

### Dimensions of the Embedding Layer

- **Input Dimension**: `vocab_length`, which is the size of the vocabulary.
- **Output Dimension**: `output_dim`, set to 256, representing the size of each embedding vector.

The output dimension is chosen to balance the richness of the representation with computational efficiency.

## Generating Embeddings

Once the input IDs are clamped to ensure they are within the vocabulary range, they are passed through the embedding layer to generate embeddings.

```python
input_ids = torch.clamp(input_ids, max=vocab_length - 1)
embeddings = embedding_layer(input_ids)
print("Sample Embedding Tensor Output:", embeddings)
print("Sample Embedding Tensor Shape:", embeddings.shape)
```

### Example Output

The embeddings for a batch have the following shape:

```
Sample Embedding Tensor Shape: torch.Size([4, 256, 256])
```

### Explanation

- **Batch Size (4)**: Corresponds to the number of sequences processed together.
- **Sequence Length (256)**: Matches the `max_length` parameter.
- **Embedding Dimension (256)**: Matches the `output_dim`, as specified. I use 256 as the dimension, GPT-3 uses 12,288 dimensions. Higher the embedding dimension, richer the embedding matrix and information that can be gained from the text corpus.

## Integrating Positional Embeddings

In addition to word embeddings, positional embeddings are crucial for transformer models to capture the order of words in a sequence. Unlike recurrent models, transformers process sequences in parallel, so they need a way to understand the position of each word. Positional embeddings provide this information by adding a unique vector to each position in the input sequence.

### Creating the Positional Embedding Layer

The positional embedding layer is initialized with the context length and output dimensions, similar to the word embedding layer. This ensures that each position in the sequence has a corresponding embedding vector.

```python
pos_embedding_layer = PositionalEmbedding(context_length=max_length, output_dim=output_dim)
pos_embeddings = pos_embedding_layer()
print("Positional Embeddings Shape:", pos_embeddings.shape)
```

### Example Output

The positional embeddings have the following shape:

```
Positional Embeddings Shape: torch.Size([256, 256])
```

### Explanation

- **Sequence Length (256)**: Matches the `max_length` parameter, providing a unique embedding for each position in the sequence.
- **Embedding Dimension (256)**: Matches the `output_dim`, ensuring compatibility with the word embeddings.

### Combining Word and Positional Embeddings

The final input vectors to the transformer model are obtained by adding the word embeddings and positional embeddings. This addition allows the model to incorporate both the semantic meaning of words and their positional context.

```python
# Assuming input_ids is already defined and processed
word_embeddings = embedding_layer(input_ids)
final_input_vectors = word_embeddings + pos_embeddings.unsqueeze(0)
print("Final Input Vectors Shape:", final_input_vectors.shape)
```

### Example Output

The final input vectors have the following shape:

```
Final Input Vectors Shape: torch.Size([4, 256, 256])
```

### Explanation

- **Batch Size (4)**: Corresponds to the number of sequences processed together.
- **Sequence Length (256)**: Matches the `max_length` parameter, ensuring each position has a corresponding embedding.
- **Embedding Dimension (256)**: Matches the `output_dim`, providing a rich representation for each token.

## Conclusion

By integrating positional embeddings with word embeddings, we create input vectors that capture both the meaning and order of words in a sequence. This setup is essential for transformer models to effectively process and understand text data. The combination of these embeddings allows the model to leverage the power of self-attention, which we shall cover in the next article.