import React from "react";

function Groups() {
  return (
    <>
      <h3>Group Management</h3>
      <button className="btn btn-primary mb-3">Create Group</button>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Name</th>
            <th>Timezone</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Corporate IT</td>
            <td>UTC</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

export default Groups;