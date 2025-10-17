import ActionsTable from "../../components/actions/ActionsTable";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

const Actions = () => {
  return (
    <>
      <PageBreadcrumb pageTitle="Products" />
      <div className="space-y-6">
        <ActionsTable />
      </div>
    </>
  );
};

export default Actions;