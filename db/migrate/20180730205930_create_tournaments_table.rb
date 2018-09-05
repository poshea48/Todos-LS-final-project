class CreateTournamentsTable < ActiveRecord::Migration[5.1]
  def change
    create_table :tournaments do |t|
      t.string :date
      t.string :type
      t.string :entry_fee
    end
  end
end
