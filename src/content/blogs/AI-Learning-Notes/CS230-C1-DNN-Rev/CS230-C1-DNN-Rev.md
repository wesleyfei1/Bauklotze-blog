---
title: 'CS230 C1:深度神经网络回顾以及代码实现'
publishDate: 2026-01-11
updatedDate: 2026-01-11
description: 'CS230 C1:深度神经网络回顾以及代码实现'
category: tech
tags:
  - cs230
  - dl
language: zh
heroImage:
  src: './images/background.jpg'
  color: '#87e5fa'
---

对于cs230主干的第一部分C1而言，coursera的视频课和cs229的神经网络部分重叠度比较高，但是通过programming assignment的实现对于使用python实现NN以及反向传播有了更加深刻的理解。接下来我们来具体的介绍以下

## 深度神经网络的代码实现

之前我们在计算参数的导数时，知道使用了链式法则，通过传递一些存储的值节约时间，但是当时在完成作业的时候出现了非常多的问题。为此，我们细致的说说它。

### 代码习惯

根据Andrew Ng所说，尽量所有的东西全部用矩阵而不是向量（np.dot(A,B)对于向量计算较麻烦），因此对于一个 x[i]=(x1[i],x2[i],….xn[i])T 以及 X=(x[1],x[2],….x[m]) ,分别用

```
xi=np.zeros((n,1))# a vector
X=np.zeros((n,m))# input matrix
```

### 数学表达

对于第l层的网络而言

$\begin{aligned} &\text{Input: } \mathbf{A}^{[l-1]} \\ &\mathbf{Z}^{[l]} = \mathbf{W}^{[l]} \mathbf{A}^{[l-1]} + \mathbf{b}^{[l]} \\ &\mathbf{A}^{[l]} = g^{[l]}(\mathbf{Z}^{[l]}) \\ &\text{Output: } \mathbf{A}^{[l]}, \text{cache}(\mathbf{Z}^{[l]}) \end{aligned}$

如果我们使用的是规范的表示形式（每个数据

$x_i$ 是 $n\times 1$ 的矩阵,向量化的输入为 $n\times m$ 那么由链式法则在矩阵求导中推广 $\dfrac{\partial L}{\partial x}=(\dfrac{\partial L}{\partial y}) \cdot \dfrac{\partial y}{\partial x}$ ，在实际的使用时就是对于两个雅可比矩阵的乘积。

而我们实际使用的时候，有的时候是 $\dfrac{\partial L}{\partial x}=(\dfrac{\partial y}{\partial x})^T \cdot \dfrac{\partial L}{\partial y}$ ，对于这个转置以及顺序该如何确定呢？关键在于维度匹配

* 对于x如果为  $n\times 1$  ,y为  $m\times 1$
* $\dfrac{\partial y}{\partial x}$  的维度是m\*n,由于  $n\times 1=(n\times m)\cdot (m\times 1)$  ,则应该为  $\dfrac{\partial L}{\partial x}=(\dfrac{\partial y}{\partial x})^T \cdot \dfrac{\partial L}{\partial y}$

在实际使用时，一般先将每一项的结果求出来，然后进行维度的匹配，根据匹配的结果去得到结果。

对于**激活函数** 而言，由于激活函数是对每一个元素作用，因此求导后结果为对应元素点乘。

**向量化表达** 中，对于参数的梯度，我们是对所有的数据的梯度取平均，然后更新所有的参数。

$\begin{aligned} &\text{Input: } d\mathbf{A}^{[l]}, \text{Cache} \\ &d\mathbf{Z}^{[l]} = d\mathbf{A}^{[l]} \odot g'^{[l]}(\mathbf{Z}^{[l]}) \\ &d\mathbf{W}^{[l]} = \frac{1}{m} d\mathbf{Z}^{[l]} \mathbf{A}^{[l-1]\top} \\ &d\mathbf{b}^{[l]} = \frac{1}{m} \sum_{i=1}^{m} d\mathbf{Z}^{[l]} \\ &d\mathbf{A}^{[l-1]} = \mathbf{W}^{[l]\top} d\mathbf{Z}^{[l]} \\ &\text{Output: } d\mathbf{A}^{[l-1]}, d\mathbf{W}^{[l]}, d\mathbf{b}^{[l]} \end{aligned}$

可以发现，对于每一层的反向传播计算时，会用到上一层对于这层的输出的导数dL/dAl, 因此反向传播的时候会将L对于这层的输入的导数给传播回去

在使用的时候，由于我们每一层都是由线性层加上激活函数构成的，因此在推导之后直接背下来就可以了。

## 参数传递

在进行**前向传播** 的时候，我们会将所有的**A[l],Z[l],parameters** 的值存进cache中，方便在反向传播中使用。

**反向传播** 的时候会传递**dA[l]** ，第l层将其作为 $\dfrac{\partial L}{\partial y}$ ,计算对于所有参数的导数，并将 $\dfrac{\partial L}{\partial x}$ 传递回去

## 代码实现

对于实现一个任意层数的网络，我们将会编写

```
def initialize_parameters_deep(layer_dims):
def linear_forward(A, W, b):
def linear_activation_forward(A_prev, W, b, activation):
def linear_backward(dZ, cache):
def linear_activation_backward(dA, cache, activation):
def compute_cost(AL, Y):
def L_model_forward(X, parameters):
def L_model_backward(AL, Y, caches):
def update_parameters(parameters, grads, learning_rate):
def L_layer_model(X, Y, layers_dims, learning_rate = 0.0075, num_iterations = 3000, print_cost=False):
```

这些函数，用于封装代码。

**初始化函数** ，如果是为了方便的话对于矩阵参数可以用标准正态分布去初始化，而对于偏置直接置零（其余的初始化方法之后会有所提及）

```
def initialize_parameters_deep(layer_dims):
    """
    parameters -- python dictionary containing your parameters "W1", "b1", ..., "WL", "bL":
                    Wl -- weight matrix of shape (layer_dims[l], layer_dims[l-1])
                    bl -- bias vector of shape (layer_dims[l], 1)
    """
    
    np.random.seed(3)
    parameters = {}
    L = len(layer_dims)            # number of layers in the network

    for l in range(1, L):
        
        parameters["W" + str(l)] = np.random.randn(layer_dims[l], layer_dims[l-1]) * 0.01
        parameters["b" + str(l)] = np.zeros((layer_dims[l], 1))

    return parameters
```

对于**前向传播** ，我们对于每一层而言，需要向前传递，并存储cache。我们将激活函数以及线性层分开实现（方便实现反向传播）

```
def linear_forward(A, W, b):
    """
    Arguments:
    A -- activations from previous layer (or input data): (size of previous layer, number of examples)
    W -- weights matrix: numpy array of shape (size of current layer, size of previous layer)
    b -- bias vector, numpy array of shape (size of the current layer, 1)

    Returns:
    Z -- the input of the activation function, also called pre-activation parameter 
    cache -- a python tuple containing "A", "W" and "b" ; stored for computing the backward pass efficiently
    """
    Z=np.dot(W,A)+b
    
    assert(Z.shape == (W.shape[0], A.shape[1]))
    cache = (A, W, b)
    
    return Z, cache
def linear_activation_forward(A_prev, W, b, activation):
    """
    Arguments:
    A_prev -- activations from previous layer (or input data): (size of previous layer, number of examples)
    W -- weights matrix: numpy array of shape (size of current layer, size of previous layer)
    b -- bias vector, numpy array of shape (size of the current layer, 1)
    activation -- the activation to be used in this layer, stored as a text string: "sigmoid" or "relu"

    Returns:
    A -- the output of the activation function, also called the post-activation value 
    cache -- a python tuple containing "linear_cache" and "activation_cache";
             stored for computing the backward pass efficiently
    """
    linear_cache=(A_prev,W,b)
    if activation == "sigmoid":
        activation_cache,_=sigmoid(np.dot(W,A_prev)+b)
        A=activation_cache
        
    
    elif activation == "relu":
       activation_cache,_=relu(np.dot(W,A_prev)+b)
        A=activation_cache
    return A, cache
```

**反向传播** 的实现，我们同样的对于线性层以及激活函数分开实现。

```
def linear_backward(dZ, cache):
    A_prev, W, b = cache
    m = A_prev.shape[1]

    dA_prev = W.T.dot(dZ)
    dW=1/m * dZ.dot(A_prev.T)
    db=1/m * np.sum(dZ,axis=1,keepdims=True)
    return dA_prev, dW, db
def linear_activation_backward(dA, cache, activation):
    linear_cache, activation_cache = cache
    
    if activation == "relu":
        dZ=relu_backward(dA,activation_cache)
       
    elif activation == "sigmoid":
        
        dZ=sigmoid_backward(dA,activation_cache)
       
    dA_prev, dW, db = linear_backward(dZ, linear_cache)
    
    return dA_prev, dW, db
```

将正向传播串起来,对于1-L遍历并存储cache，并且计算损失函数

```
def compute_cost(AL, Y):
    """
    Returns:
    cost -- cross-entropy cost
    """
    m = Y.shape[1]
    cost=-1/m * np.sum(Y*np.log(AL)+(1-Y)*np.log(1-AL))
    cost = np.squeeze(cost)      
    return cost
def L_model_forward(X, parameters):
    """
    Returns:
    AL -- last post-activation value
    caches -- list of caches containing:
                every cache of linear_activation_forward() (there are L-1 of them, indexed from 0 to L-1)
    """

    caches = []
    A = X
    L = len(parameters) 
    for l in range(1, L):
        A_prev = A 
         A,cache=linear_activation_forward(A_prev,parameters["W"+str(l)],parameters["b"+str(l)],activation="relu")
        caches.append(cache)
         AL,cache=linear_activation_forward(A,parameters["W"+str(L)],parameters["b"+str(L)],activation="sigmoid")
    caches.append(cache)
    return AL, caches
```

同时进行反向传播，单独计算对于最后的输出的导数，作为dAL,然后进行反向传播

```
def L_model_backward(AL, Y, caches):
    """
    Returns:
    grads -- A dictionary with the gradients
             grads["dA" + str(l)] = ... 
             grads["dW" + str(l)] = ...
             grads["db" + str(l)] = ... 
    """
    grads = {}
    L = len(caches) # the number of layers
    m = AL.shape[1]
    Y = Y.reshape(AL.shape) # after this line, Y is the same shape as AL
    
    # Initializing the backpropagation
    
    dAL=(Y/AL+(1-Y)/(1-AL))
    
    current_cache=caches[L-1]
    grads["dA"+str((L-1))],grads["dW"+str(L)],grads["db"+str(L)]=linear_activation_backward(dAL,current_cache,activation="sigmoid")
    
    for l in reversed(range(L-1)):
        
        current_cache=caches[l]
        grads["dA"+str(l)],grads["dW"+str(l+1)],grads["db"+str(l+1)]=linear_activation_backward(grads["dA"+str(l+1)],current_cache,activation="relu")
    return grads
```

使用优化算法（梯度下降）进行参数更新，有

```
def update_parameters(parameters, grads, learning_rate):
    L = len(parameters) 
    for l in range(L):
        parameters["W"+str(l+1)]=parameters["W"+str(l+1)]-learning_rate*grads["dW"+str(l+1)]
        parameters["b"+str(l+1)]=parameters["b"+str(l+1)]-learning_rate*grads["db"+str(l+1)]
    return parameters
```

从而实现一个训练模型的封装，只要规定好所有的超参数，就可以进行正向传播以及反向传播，并在数据集上进行训练。

```
def L_layer_model(X, Y, layers_dims, learning_rate = 0.0075, num_iterations = 3000, print_cost=False):#lr was 0.009
    
    np.random.seed(1)
    costs = []                         # keep track of cost
    
    # Parameters initialization. parameters=initialize_parameters_deep(layers_dims)
   
    # Loop (gradient descent)
    for i in range(0, num_iterations):

        # Forward propagation: [LINEAR -> RELU]*(L-1) -> LINEAR -> SIGMOID.
        AL,caches=L_model_forward(X,parameters)
       
        # Compute cost.
        cost=compute_cost(AL,Y)
        # Backward propagation.
        grads=L_model_backward(AL,Y,caches)
       
        # Update parameters.
        parameters=update_parameters(parameters,grads,learning_rate)
        
        if print_cost and i % 100 == 0:
            print ("Cost after iteration %i: %f" %(i, cost))
        if print_cost and i % 100 == 0:
            costs.append(cost)
            
    return parameters
```


以上使用框架实现了一个任意层的网络，之后我们将会对其中的超参数以及优化算法进行讨论。

