import React from "react";

function Members() {
  return (
    <>
      <div className="mb-4">
        <h2 className="fw-bold">Members</h2>
        <p className="text-muted">
          Manage all employees and system users.
        </p>
      </div>

      <div className="dashboard-card">

        <div className="d-flex justify-content-between mb-3">
          <h5>All Members</h5>
          <button className="btn btn-primary">
            + Add Member
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Working Mode</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>John Doe</td>
                <td>john.doe@company.com</td>
                <td>REMOTE</td>
                <td>Toronto, Canada</td>
                <td>
                  <span className="badge bg-success">Active</span>
                </td>
                <td>
                  <button className="btn btn-sm btn-outline-primary me-2">
                    Edit
                  </button>
                  <button className="btn btn-sm btn-outline-danger">
                    Deactivate
                  </button>
                </td>
              </tr>

              <tr>
                <td>Sarah Smith</td>
                <td>sarah.smith@company.com</td>
                <td>LOCAL</td>
                <td>Charlottetown, PEI</td>
                <td>
                  <span className="badge bg-success">Active</span>
                </td>
                <td>
                  <button className="btn btn-sm btn-outline-primary me-2">
                    Edit
                  </button>
                  <button className="btn btn-sm btn-outline-danger">
                    Deactivate
                  </button>
                </td>
              </tr>

            </tbody>
          </table>
        </div>

      </div>
    </>
  );
}

export default Members;