import { db } from "../database";

type AnalysisType =
  | "connectionHasDataCommand"
  | "connectionHasDataCommandButEmpty"
type RequiredAnalysesTypes = Array<AnalysisType>;

/**
 * Get connections to be analysed
 *
 * @returns {Promise<Array<{ id: number, connectionId: string }>>} - Array of connections to be analysed
 */
const getConnectionsToBeAnalysed = async (requiredAnalysesTypes: RequiredAnalysesTypes) => {
  const connectionsCollection = db.collection("connections");

  const pipeline = [
    {
      $lookup: {
        from: "analyses",
        let: { connId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$connectionId", "$$connId"] } } },
          { $match: { type: { $in: requiredAnalysesTypes } } }
        ],
        as: "analyses"
      }
    },
    {
      $addFields: {
        missingRequiredTypes: {
          $setDifference: [
            requiredAnalysesTypes,
            { $map: { input: "$analyses", as: "a", in: "$$a.type" } }
          ]
        }
      }
    },
    { $match: { missingRequiredTypes: { $ne: [] } } },
    { $limit: 25 },
    {
      $project: {
        _id: 0,
        missingRequiredTypes: 1,
        uuid: 1,
      }
    }
  ]

  return await connectionsCollection.aggregate(pipeline).toArray();
}

export default getConnectionsToBeAnalysed;
