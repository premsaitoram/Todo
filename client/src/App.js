import React, { useState, useEffect } from "react";

const API_BASE = "http://localhost:3001";

function App() {

  const [todos, setTodos] = useState([])
  const [popupActive, setPopupActive] = useState(false)
  const [newTodo, setNewTodo] = useState("")
  
  useEffect(() => {
    GetTodos()

    console.log(todos)
  },[])
  
  const GetTodos = () => {
  fetch(API_BASE + "/todos")
    .then(res => res.json())
    .then(data => {
      data.sort((a, b) => a.position - b.position);
      setTodos(data);
    })
    .catch(err => console.error("Error:", err))
}

  const completeTodo = async (id) => {
    const data = await fetch(API_BASE + "/todo/complete/" + id)
      .then(res => res.json())
    setTodos(todos => todos.map(todo => {
      if (todo._id === data._id) {
        todo.complete = data.complete
      }
      return todo

    }))
  }

  const deleteTodo = async (id) => {
    const data = await fetch(API_BASE + "/todo/delete/" + id, {
      method: "DELETE"
    }).then(res => res.json())
    
    setTodos(todos => todos.filter(todo => todo._id !== data._id));
  }

  const addTodo = async () => {
    const data = await fetch(API_BASE + '/todo/new', {
      method: "POST",
      headers: {
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
        text: newTodo,
        position:todos.length
      })
    }).then(res => res.json())
    //console.log(data)

    setTodos([...todos, data])
    setPopupActive(false)
    setNewTodo("")
  }
  const updatePosition = async (draggedTodoId, newPosition) => {

  await fetch(API_BASE + "/todo/position/" + draggedTodoId, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      position: newPosition
    })
  }).then(res => res.json())
  }
  const [draggedOverTodoId, setDraggedOverTodoId] = useState(null);
  const [draggedTodoId, setDraggedTodoId] = useState(null);

  const handleDragStart = (event, todoId) => {
    event.dataTransfer.setData('text/plain', todoId);
    setDraggedTodoId(todoId);
  }
  const handleDragOver = (event, todoId) => {
  event.preventDefault();
  setDraggedOverTodoId(todoId);
  event.dataTransfer.dropEffect = 'move';
  }

  const handleDrop = (event, todoId) => {
  event.preventDefault();
  const currentIndex = todos.findIndex(todo => todo._id === draggedTodoId);
  const newIndex = todos.findIndex(todo => todo._id === todoId);
  const updatedTodos = [...todos];
  updatedTodos.splice(currentIndex, 1);
  updatedTodos.splice(newIndex, 0, todos[currentIndex]);
  setTodos(updatedTodos);
  updatePosition(draggedTodoId, newIndex);

  setDraggedOverTodoId(null);
}
  
  return (
    
    <div className="App">
      <h1>Todo App</h1>
      <h4>Your Tasks</h4>
     
      <div className="todo">
                {
                  todos.map(todo => (
                    <article key={todo._id}>
                      <div className={`todos ${todo.complete ? "is-complete" : ""} ${draggedOverTodoId === todo._id ? "dragged-over" : ""}`}
                        draggable
                        onDragStart={event => handleDragStart(event, todo._id)}
                        onDragOver={event => handleDragOver(event, todo._id)}
                        onDrop={event => handleDrop(event, todo._id)}
                        key={todo._id}
                        onClick={() => completeTodo(todo._id)}
                      >
                
                      <div className="checkbox"></div>
                      <div className="text">{todo.text}</div>

                          <div className="delete-todo" onClick={() => deleteTodo(todo._id)}>X</div>
                          
                        </div>
                    </article>                  
                ))}   
          
      </div>
      <div className="addpopup" onClick={() => setPopupActive(true)}>+</div>
      
      {popupActive ? (
        <div className="popup">
          <div className="closepopup" onClick={() => setPopupActive(false)}>
            X
          </div>
          <div className="content">
            <h3>Add Task</h3>
            <input
              type="text"
              className="add-todo-input"
              onChange={e => setNewTodo(e.target.value)}
              value={newTodo}
            />
            <div
              className="button"
              onClick={addTodo}
            >
              Create Task
            </div>

          </div>

        </div>
      ):''}
    </div>
  );
}
export default App;
